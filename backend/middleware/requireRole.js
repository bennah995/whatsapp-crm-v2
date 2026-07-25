module.exports = function requireRole(allowedRole){
  return (req, res, next) => {
    if(!req.user){
      return res.status(401).json({error: "Unauthorized"});
    }
    if(req.user.role !== allowedRole){
      return res.status(403).json({error: "Forbidden: Access denied"});
    }
    next();
  }
};