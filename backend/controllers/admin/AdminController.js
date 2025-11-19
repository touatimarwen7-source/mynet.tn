const UserService = require('../../services/UserService');
const SearchService = require('../../services/SearchService');

class AdminController {
    async getAllUsers(req, res) {
        try {
            const filters = {
                role: req.query.role,
                is_verified: req.query.is_verified
            };

            const users = await UserService.getAllUsers(filters);

            res.status(200).json({
                success: true,
                count: users.length,
                users
            });
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    async getUser(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id);

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

    async getStatistics(req, res) {
        try {
            const stats = await SearchService.getStatistics();

            res.status(200).json({
                success: true,
                statistics: stats
            });
        } catch (error) {
            res.status(500).json({ 
                error: error.message 
            });
        }
    }

    async verifyUser(req, res) {
        try {
            const { id } = req.params;
            const pool = require('../../config/db').getPool();

            await pool.query(
                'UPDATE users SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
                [id]
            );

            res.status(200).json({
                success: true,
                message: 'User verified successfully'
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { is_active } = req.body;
            const pool = require('../../config/db').getPool();

            await pool.query(
                'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [is_active, id]
            );

            res.status(200).json({
                success: true,
                message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message 
            });
        }
    }
}

module.exports = new AdminController();
