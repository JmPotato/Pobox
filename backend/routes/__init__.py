from .account import account
from .dashboard import dashboard

def init_all_routes(app):
    app.register_blueprint(account)
    app.register_blueprint(dashboard)