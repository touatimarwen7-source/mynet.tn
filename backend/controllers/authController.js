const UserService = require('../services/UserService');
const KeyManagementService = require('../security/KeyManagementService');

class AuthController {
    async register(req, res) {
        try {
            const { username, email, password, full_name, phone, role, company_name, company_registration } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ 
                    error: 'Username, email, and password are required' 
                });
            }

            const user = await UserService.createUser({
                username,
                email,
                password,
                full_name,
                phone,
                role: role || 'viewer',
                company_name,
                company_registration
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email and password are required' 
                });
            }

            const authData = await UserService.authenticateUser(email, password);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                ...authData
            });
        } catch (error) {
            res.status(401).json({ 
                error: error.message 
            });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ 
                    error: 'Refresh token is required' 
                });
            }

            const decoded = KeyManagementService.verifyRefreshToken(refreshToken);
            
            const user = await UserService.getUserById(decoded.userId);
            
            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found' 
                });
            }

            const newAccessToken = KeyManagementService.generateAccessToken({
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            });

            res.status(200).json({
                success: true,
                accessToken: newAccessToken
            });
        } catch (error) {
            res.status(403).json({ 
                error: 'Invalid refresh token' 
            });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await UserService.getUserById(req.user.userId);
            
            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found' 
                });
            }

            res.status(200).json({
                success: true,
                user
            });
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const updateData = req.body;
            
            const user = await UserService.updateUser(req.user.userId, updateData);

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                user
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }
}

module.exports = new AuthController();
