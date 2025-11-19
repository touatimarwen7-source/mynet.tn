
const ReviewService = require('../../services/ReviewService');

class ReviewController {
  async createReview(req, res, next) {
    try {
      const userId = req.user.id;
      const reviewData = {
        ...req.body,
        reviewer_id: userId
      };

      const review = await ReviewService.createReview(reviewData);
      
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserReviews(req, res, next) {
    try {
      const { userId } = req.params;
      const reviews = await ReviewService.getUserReviews(userId);
      const rating = await ReviewService.getUserRating(userId);
      
      res.json({
        success: true,
        data: {
          reviews,
          rating
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
