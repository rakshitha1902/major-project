const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User'); // Assuming UserModel is defined in a separate file

exports.secretKey = process.env.SECRET_KEY;

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                const token = jwt.sign({ email: user.email }, exports.secretKey);
                res.json({ token, userId: user._id });
            } else {
                res.status(401).json({ error: 'Invalid password' });
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
        });

        res.json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
