import api from './api'

export const reviewService = {
    async getReviewsByCourse(courseId) {
        const response = await api.get(`/reviews/course/${courseId}`)
        return response.data
    },

    async addReview(reviewData) {
        const response = await api.post('/reviews', reviewData)
        return response.data
    },

    async updateReview(id, reviewData) {
        const response = await api.put(`/reviews/${id}`, reviewData)
        return response.data
    },

    async deleteReview(id) {
        const response = await api.delete(`/reviews/${id}`)
        return response.data
    }
}
