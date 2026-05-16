const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = prcoess.env.JWT_SECRET;

const verifyToken = async( req,res, next) =>{
    try{
        const token = req.cookies.token;
        if(!token) return res.status(401).json({error: 'Not Authenticated'});

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if(!user) return res.status(401).json({error: 'User not found'});

        req.user = user;
        next();

    }catch(err){
        return res.status(401).json({error: 'Invalid or expired token'});
    }
};

module.exports = { verifyToken, JWT_SECRET};