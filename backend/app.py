from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask import send_file
import io
import openpyxl
import traceback
from sqlalchemy import Date, or_, func
import datetime
from datetime import date
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
from functools import wraps
import webbrowser
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)
bcrypt = Bcrypt(app)


class Funcionario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome_completo = db.Column(db.String(200), nullable=False)
    cpf = db.Column(db.String(11), unique=True, nullable=False) 
    matricula = db.Column(db.String(20), unique=True, nullable=True) 
    data_nascimento = db.Column(db.Date, nullable=True)
    sexo = db.Column(db.String(20), nullable=True)
    cargo = db.Column(db.String(100), nullable=False)
    tipo_vinculo = db.Column(db.String(50), nullable=False) 
    situacao = db.Column(db.String(50), nullable=False)
    localizacao_fisica = db.Column(db.String(300), nullable=False)

   
    pcd = db.Column(db.Boolean, default=False)
    readaptado = db.Column(db.Boolean, default=False)
    data_admissao = db.Column(db.Date, nullable=False)
    data_desligamento = db.Column(db.Date, nullable=True)

    cid = db.Column(db.String(50), nullable=True)
    data_readaptacao = db.Column(db.Date, nullable=True)
    data_aposentadoria = db.Column(db.Date, nullable=True)
    dodf_aposentadoria = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nome_completo': self.nome_completo,
            'cpf': self.cpf,
            'matricula': self.matricula,
            'data_nascimento': self.data_nascimento.isoformat() if self.data_nascimento else None,
            'sexo': self.sexo,
            'cargo': self.cargo,
            'tipo_vinculo': self.tipo_vinculo,
            'situacao': self.situacao,
            'localizacao_fisica': self.localizacao_fisica,
            'data_admissao': self.data_admissao.isoformat() if self.data_admissao else None,
            'pcd': self.pcd,
            'readaptado': self.readaptado,
            'data_desligamento': self.data_desligamento.isoformat() if self.data_desligamento else None,
            'cid': self.cid,
            'data_readaptacao': self.data_readaptacao.isoformat() if self.data_readaptacao else None,
            'data_aposentadoria': self.data_aposentadoria.isoformat() if self.data_aposentadoria else None,
            'dodf_aposentadoria': self.dodf_aposentadoria
        }

    def __repr__(self):
        return f"<Funcionario {self.nome_completo}>"
    


class Tarefa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    conteudo = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), default='afazer')
    # --- NOVO CAMPO ---
    data_prazo = db.Column(db.Date, nullable=True) 
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Aviso(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    conteudo = db.Column(db.String(500), nullable=False)
    # --- NOVO CAMPO ---
    data_prazo = db.Column(db.Date, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

  
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(60), nullable=False)
    cargo = db.Column(db.String(100), nullable=True)
    instituicao = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return f'<User {self.email}>'


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # O frontend deve enviar o token no cabeçalho 'x-access-token'
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message': 'Token não encontrado!'}), 401

        try:
            # Decodifica o token usando nossa chave secreta
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # Pega o usuário do banco de dados com base no id do token
            current_user = User.query.get(data['user_id'])
        except Exception as e:
            return jsonify({'message': 'Token é inválido!'}), 401
        
        # Passa o usuário logado para a rota
        return f(current_user, *args, **kwargs)
    return decorated

def format_date(date_string):
    if date_string:
        try:
            return datetime.datetime.strptime(date_string, '%Y-%m-%d').date()
        except ValueError:
            return None
    return None

@app.route("/")
def home():
    return "App funcionando! Use as rotas /funcionarios para CRUD."

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Verifica se o e-mail já existe no banco
    user_exists = User.query.filter_by(email=data['email']).first()
    if user_exists:
        # Retorna um erro 409 (Conflict) se o e-mail já estiver em uso
        return jsonify({'message': 'E-mail já cadastrado'}), 409

    # Gera o hash da senha. O .decode('utf-8') é importante para o formato.
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    new_user = User(
        name=data.get('name'),
        email=data['email'], 
        password_hash=hashed_password, 
        cargo=data.get('cargo'), 
        instituicao=data.get('instituicao')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Retorna uma mensagem de sucesso com o status 201 (Created)
    return jsonify({'message': 'Usuário criado com sucesso!'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Procura o usuário pelo e-mail no banco de dados
    user = User.query.filter_by(email=data['email']).first()

    # Se o usuário não for encontrado ou a senha estiver incorreta...
    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        # Retorna um erro 401 (Unauthorized)
        return jsonify({'message': 'Credenciais inválidas'}), 401

    # Se o login for bem-sucedido, criamos o token (o "crachá")
    token = jwt.encode(
        {
            'user_id': user.id,
            # 'exp' define o tempo de validade do token (ex: 30 minutos)
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        },
        app.config['SECRET_KEY'],
        algorithm="HS256" # Algoritmo de criptografia do token
    )
    
    # Retorna o token para o frontend
    return jsonify({'token': token})

@app.route("/funcionarios", methods=['POST'])
@token_required
def criar_funcionario(current_user):
    try: # <--- ADICIONE
        dados = request.json

        data_admissao = format_date(dados.get('data_admissao'))
        data_readaptacao = format_date(dados.get('data_readaptacao'))
        data_aposentadoria = format_date(dados.get('data_aposentadoria'))
        data_desligamento = format_date(dados.get('data_desligamento'))
        data_nascimento = format_date(dados.get('data_nascimento'))

        novo_funcionario = Funcionario(
            nome_completo=dados['nome_completo'],
            cpf=dados['cpf'],
            matricula=dados.get('matricula'),
            data_nascimento=data_nascimento,
            sexo=dados.get('sexo'),
            cargo=dados['cargo'],
            tipo_vinculo=dados['tipo_vinculo'],
            situacao=dados['situacao'],
            localizacao_fisica=dados['localizacao_fisica'],
            data_admissao=data_admissao,
            data_desligamento=data_desligamento,
            pcd=dados.get('pcd', False),
            readaptado=dados.get('readaptado', False),
            cid=dados.get('cid'),
            data_readaptacao=data_readaptacao,
            data_aposentadoria=data_aposentadoria,
            dodf_aposentadoria=dados.get('dodf_aposentadoria')
        )
        db.session.add(novo_funcionario)
        db.session.commit()
        return jsonify(novo_funcionario.to_dict()), 201
    except Exception as e: # <--- ADICIONE ESTE BLOCO
        print(traceback.format_exc())
        return jsonify({'message': 'Erro interno ao criar funcionário', 'error': str(e)}), 500

@app.route("/funcionarios", methods=['GET'])
@token_required
def listar_funcionarios(current_user):
    todos_funcionarios = Funcionario.query.all()
    return jsonify([funcionario.to_dict() for funcionario in todos_funcionarios])

@app.route("/funcionarios/<int:id_funcionario>", methods=['GET'])
@token_required
def buscar_funcionario_por_id(current_user, id_funcionario):
    funcionario = Funcionario.query.get_or_404(id_funcionario)
    return jsonify(funcionario.to_dict())

@app.route("/funcionarios/<int:id_funcionario>", methods=['PUT'])
@token_required
def atualizar_funcionario(current_user, id_funcionario):
    
    try:
        funcionario = Funcionario.query.get_or_404(id_funcionario)
        dados = request.get_json()

        # Atualiza cada campo com os novos dados, mantendo o valor antigo se um novo não for fornecido
        funcionario.nome_completo = dados.get('nome_completo', funcionario.nome_completo)
        funcionario.cpf = dados.get('cpf', funcionario.cpf)
        funcionario.matricula = dados.get('matricula', funcionario.matricula)
        funcionario.cargo = dados.get('cargo', funcionario.cargo)
        funcionario.tipo_vinculo = dados.get('tipo_vinculo', funcionario.tipo_vinculo)
        funcionario.situacao = dados.get('situacao', funcionario.situacao)
        funcionario.localizacao_fisica = dados.get('localizacao_fisica', funcionario.localizacao_fisica)
        
        # Atualiza campos booleanos
        funcionario.pcd = dados.get('pcd', funcionario.pcd)
        funcionario.readaptado = dados.get('readaptado', funcionario.readaptado)

        # Atualiza os novos campos
        funcionario.cid = dados.get('cid', funcionario.cid)
        funcionario.dodf_aposentadoria = dados.get('dodf_aposentadoria', funcionario.dodf_aposentadoria)
        funcionario.sexo = dados.get('sexo', funcionario.sexo)
        if 'data_nascimento' in dados:
            funcionario.data_nascimento = format_date(dados.get('data_nascimento'))
        if 'data_desligamento' in dados:
            funcionario.data_desligamento = format_date(dados.get('data_desligamento'))

        # Atualiza as datas usando nossa função auxiliar
        if 'data_admissao' in dados:
            funcionario.data_admissao = format_date(dados.get('data_admissao'))
        if 'data_readaptacao' in dados:
            funcionario.data_readaptacao = format_date(dados.get('data_readaptacao'))
        if 'data_aposentadoria' in dados:
            funcionario.data_aposentadoria = format_date(dados.get('data_aposentadoria'))
        if 'data_desligamento' in dados:
            funcionario.data_desligamento = format_date(dados.get('data_desligamento'))
        
        db.session.commit()
        return jsonify(funcionario.to_dict())

    except Exception as e: # <--- ADICIONE ESTE BLOCO
        print(traceback.format_exc())
        return jsonify({'message': 'Erro interno ao criar funcionário', 'error': str(e)}), 500

@app.route("/funcionarios/<int:id_funcionario>", methods=['DELETE'])
@token_required
def deletar_funcionario(current_user, id_funcionario):
    funcionario = Funcionario.query.get_or_404(id_funcionario)
    db.session.delete(funcionario)
    db.session.commit()
    return jsonify({'mensagem': 'Funcionário deletado com sucesso!'})

@app.route("/funcionarios/buscar", methods=['GET'])
@token_required
def buscar_funcionarios(current_user):
    # Pegamos os argumentos da URL, ex: ?nome=Maria
    termo_busca = request.args.get('q')

    # Começamos com uma consulta que pega todos os funcionários
    query = Funcionario.query

    # E agora aplicamos os filtros, se eles foram fornecidos
    if termo_busca:
        query = query.filter(
            or_(
                Funcionario.nome_completo.ilike(f"%{termo_busca}%"),
                Funcionario.cpf.ilike(f"%{termo_busca}%"),
                Funcionario.matricula.ilike(f"%{termo_busca}%")
            )
        )
    
    # Executamos a consulta final e retornamos os resultados
    resultados = query.all()
    return jsonify([funcionario.to_dict() for funcionario in resultados])

@app.route("/funcionarios/estatisticas", methods=['GET'])
@token_required
def get_estatisticas(current_user):
    try:
        todos_funcionarios = Funcionario.query.all()
        # 1. Total de Funcionários (já tínhamos)
        total_funcionarios = Funcionario.query.count()

        faixa_etaria = {
            "-20": 0,
            "20-30": 0,
            "30-40": 0,
            "40-50": 0,
            "50-60": 0,
            "60+": 0
        }

        hoje = date.today()

        for f in todos_funcionarios:
            if f.data_nascimento:
                    idade = hoje.year - f.data_nascimento.year - ((hoje.month, hoje.day) < (f.data_nascimento.month, f.data_nascimento.day))
                    
                    # 2. Lógica de agrupamento corrigida
                    if idade < 20:
                        faixa_etaria["-20"] += 1
                    elif 20 <= idade <= 30:
                        faixa_etaria["20-30"] += 1
                    elif 31 <= idade <= 40:
                        faixa_etaria["30-40"] += 1
                    # Note que estamos ignorando idades entre 41 e 50, como na sua lista
                    elif 51 <= idade <= 60:
                        faixa_etaria["50-60"] += 1
                    elif idade > 60:
                        faixa_etaria["60+"] += 1

        contagem_sexo_query = db.session.query(
            Funcionario.sexo, 
            func.count(Funcionario.id)
        ).group_by(Funcionario.sexo).all()
        contagem_sexo = {sexo: count for sexo, count in contagem_sexo_query}
        # 2. Contagem por Tipo de Vínculo (já tínhamos)
        contagem_vinculo_query = db.session.query(
            Funcionario.tipo_vinculo, 
            func.count(Funcionario.id)
        ).group_by(Funcionario.tipo_vinculo).all()
        contagem_vinculo = {vinculo: count for vinculo, count in contagem_vinculo_query}

        # 3. Contagem por Situação (já tínhamos)
        contagem_situacao_query = db.session.query(
            Funcionario.situacao, 
            func.count(Funcionario.id)
        ).group_by(Funcionario.situacao).all()
        contagem_situacao = {situacao: count for situacao, count in contagem_situacao_query}

        # --- NOVO CÁLCULO: TEMPO MÉDIO DE SERVIÇO ---
        # Vamos calcular a diferença em dias entre hoje e a data de admissão
        # (ou data de desligamento, se o funcionário estiver inativo)

        # Pega a data de hoje
        hoje = date.today()

        # Seleciona todos os funcionários que TÊM uma data de admissão
        funcionarios_com_admissao = Funcionario.query.filter(Funcionario.data_admissao.isnot(None)).all()

        total_dias_servico = 0
        if len(funcionarios_com_admissao) > 0:
            for f in funcionarios_com_admissao:
                # Se o funcionário está desligado, usa a data de desligamento
                data_fim = f.data_desligamento if f.data_desligamento else hoje
                # Se a data de admissão for inválida ou posterior à data fim, ignora
                if f.data_admissao and data_fim > f.data_admissao:
                    total_dias_servico += (data_fim - f.data_admissao).days

            # Calcula a média de dias e depois converte para anos
            media_dias = total_dias_servico / len(funcionarios_com_admissao)
            tempo_medio_anos = round(media_dias / 365.25, 1) # Arredonda para 1 casa decimal
        else:
            tempo_medio_anos = 0.0

        # 4. Monta o objeto de resposta ATUALIZADO
        estatisticas = {
            'total_funcionarios': total_funcionarios,
            'por_vinculo': contagem_vinculo,
            'por_situacao': contagem_situacao,
            'tempo_medio_servico_anos': tempo_medio_anos, # <-- Novo dado
            'por_sexo': contagem_sexo,
            'por_faixa_etaria': faixa_etaria,
        }
        
        return jsonify(estatisticas), 200

    except Exception as e:
        # Captura qualquer erro que possa acontecer durante a consulta
        print(traceback.format_exc())
        return jsonify({'message': 'Erro ao calcular estatísticas', 'error': str(e)}), 500

@app.route("/funcionarios/exportar", methods=['GET'])
@token_required
def exportar_excel(current_user):
    try:
        # 1. Buscar todos os funcionários no banco
        funcionarios = Funcionario.query.order_by(Funcionario.nome_completo).all()

        # 2. Criar um "arquivo Excel" em memória
        workbook = openpyxl.Workbook()
        sheet = workbook.active
        sheet.title = "Relatório de Funcionários"

        # 3. Criar a linha do Cabeçalho
        headers = [
            "ID", "Nome Completo", "CPF", "Matrícula", "Cargo", 
            "Tipo de Vínculo", "Situação", "Localização Física", 
            "Data de Admissão", "PCD", "CID", "Readaptado", 
            "Data de Readaptação", "Data de Aposentadoria", "DODF Aposentadoria"
        ]
        sheet.append(headers)

        # 4. Preencher a planilha com os dados
        for func in funcionarios:
            sheet.append([
                func.id,
                func.nome_completo,
                func.cpf,
                func.matricula,
                func.cargo,
                func.tipo_vinculo,
                func.situacao,
                func.localizacao_fisica,
                func.data_admissao.isoformat() if func.data_admissao else None,
                func.pcd,
                func.cid,
                func.readaptado,
                func.data_readaptacao.isoformat() if func.data_readaptacao else None,
                func.data_aposentadoria.isoformat() if func.data_aposentadoria else None,
                func.dodf_aposentadoria
            ])

        # 5. Salvar o arquivo em um "stream" de bytes na memória
        memoria_virtual = io.BytesIO()
        workbook.save(memoria_virtual)
        memoria_virtual.seek(0) # Retorna ao início do "arquivo"

        # 6. Enviar o arquivo em memória para o usuário
        return send_file(
            memoria_virtual,
            as_attachment=True,
            download_name="relatorio_funcionarios.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    except Exception as e:
    # Esta linha vai imprimir o traceback completo no seu terminal do Flask
        print(traceback.format_exc())
        return jsonify({'message': 'Erro ao gerar o relatório', 'error': str(e)}), 500
    
# --- ROTAS DO PAINEL (DASHBOARD) ---

@app.route("/user/me", methods=['GET'])
@token_required
def get_me(current_user):
    # Retorna os dados do usuário logado para o card de perfil
    return jsonify({
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'cargo': current_user.cargo,
        'instituicao': current_user.instituicao
    })

# --- Rotas de Tarefas (Kanban) ---
@app.route("/tarefas", methods=['GET', 'POST'])
@token_required
def manage_tarefas(current_user):
    if request.method == 'POST':
        data = request.json
        # Converte a string de data para objeto Date, se existir
        prazo = format_date(data.get('data_prazo'))

        nova_tarefa = Tarefa(
            conteudo=data['conteudo'], 
            status='afazer', 
            data_prazo=prazo, # Salvando a data
            user_id=current_user.id
        )
        db.session.add(nova_tarefa)
        db.session.commit()
        return jsonify({'message': 'Tarefa criada', 'id': nova_tarefa.id}), 201

    tarefas = Tarefa.query.filter_by(user_id=current_user.id).all()
    output = [{
        'id': t.id, 
        'conteudo': t.conteudo, 
        'status': t.status,
        'data_prazo': t.data_prazo.isoformat() if t.data_prazo else None
    } for t in tarefas]
    return jsonify(output)

@app.route("/tarefas/<int:id>", methods=['PUT', 'DELETE'])
@token_required
def update_tarefa(current_user, id):
    tarefa = Tarefa.query.get_or_404(id)
    if tarefa.user_id != current_user.id:
        return jsonify({'message': 'Acesso negado'}), 403

    if request.method == 'DELETE':
        db.session.delete(tarefa)
        db.session.commit()
        return jsonify({'message': 'Tarefa deletada'})

    # PUT: Agora permite atualizar status, conteudo e data
    data = request.json
    if 'status' in data:
        tarefa.status = data['status']
    if 'conteudo' in data:
        tarefa.conteudo = data['conteudo']
    if 'data_prazo' in data:
        tarefa.data_prazo = format_date(data['data_prazo'])

    db.session.commit()
    return jsonify({'message': 'Tarefa atualizada'})

# --- Rotas de Avisos ---
@app.route("/avisos", methods=['GET', 'POST'])
@token_required
def manage_avisos(current_user):
    if request.method == 'POST':
        data = request.json
        prazo = format_date(data.get('data_prazo'))

        novo_aviso = Aviso(
            conteudo=data['conteudo'], 
            data_prazo=prazo, # Salvando a data
            user_id=current_user.id
        )
        db.session.add(novo_aviso)
        db.session.commit()
        return jsonify({'message': 'Aviso criado', 'id': novo_aviso.id}), 201

    avisos = Aviso.query.filter_by(user_id=current_user.id).all()
    output = [{
        'id': a.id, 
        'conteudo': a.conteudo,
        'data_prazo': a.data_prazo.isoformat() if a.data_prazo else None
    } for a in avisos]
    return jsonify(output)

# --- NOVA ROTA PARA DELETAR AVISOS ---
@app.route("/avisos/<int:id>", methods=['DELETE'])
@token_required
def delete_aviso(current_user, id):
    aviso = Aviso.query.get_or_404(id)
    if aviso.user_id != current_user.id:
        return jsonify({'message': 'Acesso negado'}), 403

    db.session.delete(aviso)
    db.session.commit()
    return jsonify({'message': 'Aviso deletado'})


@app.route("/user/update", methods=['PUT'])
@token_required
def update_user_info(current_user):
    data = request.json
    try:
        user = User.query.get(current_user.id)
        if 'name' in data: user.name = data['name']
        if 'email' in data: user.email = data['email']
        if 'cargo' in data: user.cargo = data['cargo']
        if 'instituicao' in data: user.instituicao = data['instituicao']
        db.session.commit()
        return jsonify({'message': 'Dados atualizados!'})
    except Exception as e:
        return jsonify({'message': 'Erro ao atualizar', 'error': str(e)}), 500

@app.route("/user/change-password", methods=['PUT'])
@token_required
def change_password(current_user):
    data = request.json
    if not data.get('new_password'):
        return jsonify({'message': 'Nova senha obrigatória'}), 400
    user = User.query.get(current_user.id)
    user.password_hash = bcrypt.generate_password_hash(data['new_password']).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Senha alterada!'})

@app.route("/user/delete", methods=['DELETE'])
@token_required
def delete_account(current_user):
    user = User.query.get(current_user.id)
    # Limpa dados relacionados
    Tarefa.query.filter_by(user_id=user.id).delete()
    Aviso.query.filter_by(user_id=user.id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Conta excluída!'})

if __name__ == "__main__":

    with app.app_context():
        db.create_all()
    app.run(debug=True)