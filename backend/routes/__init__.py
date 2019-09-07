from .route import main

def init_all_routes(app):
    app.register_blueprint(main)