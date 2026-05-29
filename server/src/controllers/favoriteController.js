import { addFavorite, listFavorites, removeFavorite } from '../models/favoriteModel.js';
import { ApiError } from '../utils/apiError.js';

export async function index(req, res) {
  if (req.user.role !== 'buyer') throw new ApiError(403, 'Only buyers can use favorites');
  res.json(await listFavorites(req.user.id));
}

export async function create(req, res) {
  if (req.user.role !== 'buyer') throw new ApiError(403, 'Only buyers can save favorite properties');
  await addFavorite(req.user.id, req.params.propertyId);
  res.status(201).json({ saved: true });
}

export async function destroy(req, res) {
  if (req.user.role !== 'buyer') throw new ApiError(403, 'Only buyers can remove favorite properties');
  await removeFavorite(req.user.id, req.params.propertyId);
  res.json({ removed: true });
}
