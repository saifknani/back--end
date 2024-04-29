
export function checkUserRole(requiredRole) {
    return (req, res, next) => {
      const userRole = req.user.role; 
      if (userRole === requiredRole || userRole === "admin") {
        next(); 
      } else {
        res.status(403).json({ message: "Access denied. Insufficient privileges." });
      }
      console.log("User Role:", userRole);
console.log("Required Role:", requiredRole);
    };
    
  }
  


  export function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
     
      return next();
    } else {
      
      res.redirect('/login'); 
    }
  }