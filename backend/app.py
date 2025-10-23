from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Date, or_, func
import datetime
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
  
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
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
    dados = request.json

    data_admissao = format_date(dados.get('data_admissao'))
    data_readaptacao = format_date(dados.get('data_readaptacao'))
    data_aposentadoria = format_date(dados.get('data_aposentadoria'))
    data_desligamento = format_date(dados.get('data_desligamento'))

    novo_funcionario = Funcionario(
        nome_completo=dados['nome_completo'],
        cpf=dados['cpf'],
        matricula=dados.get('matricula'),
        cargo=dados['cargo'],
        tipo_vinculo=dados['tipo_vinculo'],
        situacao=dados['situacao'],
        localizacao_fisica=dados.get('localizacao_fisica'),
        data_admissao=data_admissao,
        cid=dados.get('cid'),
        data_readaptacao=data_readaptacao,
        data_aposentadoria=data_aposentadoria,
        dodf_aposentadoria=dados.get('dodf_aposentadoria'),
        data_desligamento=data_desligamento,


        pcd=dados.get('pcd', False),
        readaptado=dados.get('readaptado', False)
    )

    db.session.add(novo_funcionario)
    db.session.commit()

    return jsonify(novo_funcionario.to_dict()), 201

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
        # 1. Total de Funcionários
        total_funcionarios = Funcionario.query.count()

        # 2. Contagem por Tipo de Vínculo
        # Isso agrupa os funcionários pelo campo 'tipo_vinculo',
        # conta quantos há em cada grupo e retorna uma lista de tuplas.
        # Ex: [('Efetivo', 80), ('Temporário', 62)]
        contagem_vinculo_query = db.session.query(
            Funcionario.tipo_vinculo, 
            func.count(Funcionario.id)
        ).group_by(Funcionario.tipo_vinculo).all()

        # Converte a lista de tuplas em um dicionário mais fácil de usar
        # Ex: {'Efetivo': 80, 'Temporário': 62}
        contagem_vinculo = {vinculo: count for vinculo, count in contagem_vinculo_query}

        # 3. Contagem por Situação (Ativos/Inativos)
        # Mesma lógica, mas agrupando por 'situacao'
        contagem_situacao_query = db.session.query(
            Funcionario.situacao, 
            func.count(Funcionario.id)
        ).group_by(Funcionario.situacao).all()
        
        contagem_situacao = {situacao: count for situacao, count in contagem_situacao_query}

        # 4. Monta o objeto de resposta
        estatisticas = {
            'total_funcionarios': total_funcionarios,
            'por_vinculo': contagem_vinculo,
            'por_situacao': contagem_situacao
        }
        
        return jsonify(estatisticas), 200

    except Exception as e:
        # Captura qualquer erro que possa acontecer durante a consulta
        return jsonify({'message': 'Erro ao calcular estatísticas', 'error': str(e)}), 500

if __name__ == "__main__":

    with app.app_context():
        db.create_all()
    app.run(debug=True)