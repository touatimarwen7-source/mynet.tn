
const { getPool } = require('../../config/db');
const logger = require('../../utils/logger');

const { getPool } = require('../../config/db');
const logger = require('../../utils/logger');

class AdvertisementController {
  /**
   * Get all advertisements
   */
  async getAllAds(req, res) {
    const pool = getPool();
    const { is_active, placement } = req.query;

    try {
      let query = `
        SELECT 
          a.*,
          COUNT(ai.id) as impression_count,
          COUNT(CASE WHEN ai.clicked = true THEN 1 END) as click_count
        FROM advertisements a
        LEFT JOIN ad_impressions ai ON a.id = ai.ad_id
        WHERE 1=1
      `;

      const params = [];
      let paramIndex = 1;

      if (is_active !== undefined) {
        query += ` AND a.is_active = $${paramIndex++}`;
        params.push(is_active === 'true');
      }

      if (placement) {
        query += ` AND a.placement = $${paramIndex++}`;
        params.push(placement);
      }

      query += ` GROUP BY a.id ORDER BY a.created_at DESC`;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      logger.error('Error fetching advertisements:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create advertisement
   */
  async createAd(req, res) {
    const pool = getPool();
    const {
      title,
      description,
      image_url,
      link_url,
      cta_text,
      ad_type,
      placement,
      target_audience,
      start_date,
      end_date,
      priority = 0
    } = req.body;

    try {
      const result = await pool.query(`
        INSERT INTO advertisements 
        (title, description, image_url, link_url, cta_text, ad_type, 
         placement, target_audience, start_date, end_date, priority, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
        RETURNING *
      `, [
        title,
        description,
        image_url,
        link_url,
        cta_text,
        ad_type,
        placement,
        JSON.stringify(target_audience || {}),
        start_date,
        end_date,
        priority
      ]);

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Publicité créée avec succès'
      });
    } catch (error) {
      logger.error('Error creating advertisement:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update advertisement
   */
  async updateAd(req, res) {
    const pool = getPool();
    const { id } = req.params;
    const updateData = req.body;

    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(updateData).forEach(key => {
        if (key === 'target_audience') {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(JSON.stringify(updateData[key]));
        } else if (updateData[key] !== undefined) {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Aucune donnée à mettre à jour'
        });
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE advertisements
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Publicité non trouvée'
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Publicité mise à jour avec succès'
      });
    } catch (error) {
      logger.error('Error updating advertisement:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete advertisement
   */
  async deleteAd(req, res) {
    const pool = getPool();
    const { id } = req.params;

    try {
      await pool.query('DELETE FROM advertisements WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Publicité supprimée avec succès'
      });
    } catch (error) {
      logger.error('Error deleting advertisement:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get advertisement analytics
   */
  async getAdAnalytics(req, res) {
    const pool = getPool();
    const { id } = req.params;

    try {
      const result = await pool.query(`
        SELECT 
          a.*,
          COUNT(ai.id) as total_impressions,
          COUNT(CASE WHEN ai.clicked = true THEN 1 END) as total_clicks,
          CASE 
            WHEN COUNT(ai.id) > 0 
            THEN ROUND((COUNT(CASE WHEN ai.clicked = true THEN 1 END)::numeric / COUNT(ai.id)::numeric * 100), 2)
            ELSE 0
          END as ctr_percentage,
          COUNT(DISTINCT ai.user_id) as unique_viewers
        FROM advertisements a
        LEFT JOIN ad_impressions ai ON a.id = ai.ad_id
        WHERE a.id = $1
        GROUP BY a.id
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Publicité non trouvée'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error fetching ad analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Track ad impression
   */
  async trackImpression(req, res) {
    const pool = getPool();
    const { ad_id } = req.body;
    const user_id = req.user?.id;

    try {
      await pool.query(`
        INSERT INTO ad_impressions (ad_id, user_id, clicked)
        VALUES ($1, $2, FALSE)
      `, [ad_id, user_id]);

      res.json({
        success: true,
        message: 'Impression enregistrée'
      });
    } catch (error) {
      logger.error('Error tracking impression:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Track ad click
   */
  async trackClick(req, res) {
    const pool = getPool();
    const { ad_id } = req.body;
    const user_id = req.user?.id;

    try {
      await pool.query(`
        INSERT INTO ad_impressions (ad_id, user_id, clicked)
        VALUES ($1, $2, TRUE)
      `, [ad_id, user_id]);

      res.json({
        success: true,
        message: 'Clic enregistré'
      });
    } catch (error) {
      logger.error('Error tracking click:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AdvertisementController();

module.exports = new AdvertisementController();
