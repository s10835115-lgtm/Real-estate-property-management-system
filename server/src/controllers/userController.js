import { deleteUser, listUsers, updateUserRole, toggleUserSuspension } from '../models/userModel.js';
import { logActivity } from '../models/activityLogModel.js';
import { z } from 'zod';

export async function index(req, res) {
  res.json(await listUsers());
}

export async function destroy(req, res) {
  await deleteUser(req.params.id);
  await logActivity(req.user.id, 'DELETE_USER', `Deleted user account ID ${req.params.id}`);
  res.json({ deleted: true });
}

export async function changeRole(req, res) {
  const role = z.enum(['buyer', 'seller', 'agent', 'admin']).parse(req.body.role);
  const updated = await updateUserRole(req.params.id, role);
  await logActivity(req.user.id, 'CHANGE_ROLE', `Updated role of user ID ${req.params.id} (${updated.email}) to ${role}`);
  res.json(updated);
}

export async function toggleSuspend(req, res) {
  const payload = z.object({ is_suspended: z.boolean(), reason: z.string().optional() }).parse(req.body);
  const updated = await toggleUserSuspension(req.params.id, payload.is_suspended, payload.reason || null);
  const action = payload.is_suspended ? 'SUSPEND_USER' : 'UNSUSPEND_USER';
  await logActivity(req.user.id, action, `${payload.is_suspended ? 'Suspended' : 'Unsuspended'} user ID ${req.params.id} (${updated.email})${payload.reason ? ` Reason: ${payload.reason}` : ''}`);
  res.json(updated);
}
