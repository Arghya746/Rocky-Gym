const express = require('express');

const {
    addMember,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember,
} = require('../controllers/memberController');

const {
    protect,
    authorizeBranch,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();

/* =========================================================
   GET ALL MEMBERS
   GET /api/members

   Main Admin:
   - Can access both branches

   Receptionist:
   - Can access assigned branch only

   Permission:
   - members.view
   ========================================================= */

router.get(
    '/',
    protect,
    authorizeBranch,
    requirePermission('members.view'),
    getMembers
);


/* =========================================================
   ADD MEMBER
   POST /api/members

   Main Admin:
   - Must provide a valid gymBranch

   Receptionist:
   - Member is created in their assigned branch

   Permission:
   - members.add
   ========================================================= */

router.post(
    '/',
    protect,
    authorizeBranch,
    requirePermission('members.add'),
    addMember
);


/* =========================================================
   GET SINGLE MEMBER
   GET /api/members/:id

   Branch isolation is enforced.
   ========================================================= */

router.get(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('members.view'),
    getMemberById
);


/* =========================================================
   UPDATE MEMBER
   PUT /api/members/:id

   Main Admin:
   - Can update members from either branch
   - Can change branch to a valid branch

   Receptionist:
   - Can update only members from assigned branch
   - Cannot move member to another branch

   Permission:
   - members.edit
   ========================================================= */

router.put(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('members.edit'),
    updateMember
);


/* =========================================================
   DELETE MEMBER
   DELETE /api/members/:id

   Branch isolation is enforced by the controller.

   Permission:
   - members.delete
   ========================================================= */

router.delete(
    '/:id',
    protect,
    authorizeBranch,
    requirePermission('members.delete'),
    deleteMember
);


/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;