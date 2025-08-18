const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    required: true,
    enum: ['demande_transfert', 'transfert_accepte', 'transfert_annule', 'autre'],
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type', // Optionnel, pour plus de flexibilité
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);