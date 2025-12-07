"""Security dependencies for FastAPI endpoints."""
from fastapi import Header, HTTPException
from auth import decode_jwt

def require(role: str = None):
    """Create a dependency that requires authentication and optionally a specific role."""
    def dependency(authorization: str = Header(None)):
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        try:
            token = authorization.split()[1]
            claims = decode_jwt(token)
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
        
        if role and claims.get("role") != role:
            raise HTTPException(status_code=403, detail=f"Forbidden: requires {role} role")
        
        return claims
    
    return dependency
