from app.routes.auth_routes import router as auth_router
from app.routes.employee_routes import router as employee_router
from app.routes.admin_routes import router as admin_router

__all__ = ["auth_router", "employee_router", "admin_router"]
