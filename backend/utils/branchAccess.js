// ============================================================
// ALPHA GYM — BRANCH ACCESS HELPERS
// ============================================================
//
// Supported branches:
// - Kalyanpur
// - Gopalpur
//
// Main Admin:
// - admin
// - main_admin
// - super_admin
//
// Branch Staff:
// - receptionist
// - staff
//
// This utility is shared by controllers/middleware that need
// branch-aware access control.
//
// IMPORTANT:
// - "all" is a UI selection for Main Admin.
// - "all" is never stored as a gymBranch value.
// ============================================================


// ============================================================
// VALID BRANCHES
// ============================================================

const VALID_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];


// ============================================================
// MAIN ADMIN ROLES
// ============================================================

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];


// ============================================================
// RECEPTION / STAFF ROLES
// ============================================================

const RECEPTION_ROLES = [
    'receptionist',
    'staff',
];


// ============================================================
// NORMALIZE ROLE
// ============================================================

const normalizeRole = (value) => {

    if (!value) {
        return '';
    }

    return String(value)
        .trim()
        .toLowerCase();
};


// ============================================================
// NORMALIZE SINGLE BRANCH
// ============================================================

const normalizeBranch = (value) => {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {
        return null;
    }

    // --------------------------------------------------------
    // Support branch objects
    // --------------------------------------------------------

    let rawValue = value;

    if (
        typeof value === 'object'
    ) {

        rawValue =
            value._id ||
            value.name ||
            value.branchName ||
            value.gymBranch ||
            '';
    }

    const normalized =
        String(rawValue)
        .trim()
        .toLowerCase();

    // --------------------------------------------------------
    // "all" is a UI value, not a real branch
    // --------------------------------------------------------

    if (
        normalized === 'all'
    ) {
        return null;
    }

    // --------------------------------------------------------
    // Kalyanpur
    // --------------------------------------------------------

    if (
        normalized === 'kalyanpur'
    ) {
        return 'Kalyanpur';
    }

    // --------------------------------------------------------
    // Gopalpur
    // --------------------------------------------------------

    if (
        normalized === 'gopalpur'
    ) {
        return 'Gopalpur';
    }

    return null;
};


// ============================================================
// NORMALIZE BRANCH ARRAY
// ============================================================

const normalizeBranches = (values) => {

    if (!Array.isArray(values)) {
        return [];
    }

    return [
        ...new Set(
            values
            .map(normalizeBranch)
            .filter(Boolean)
        ),
    ];
};


// ============================================================
// ROLE CHECKS
// ============================================================

const isMainAdminRole = (role) => {

    return MAIN_ADMIN_ROLES.includes(
        normalizeRole(role)
    );
};


const isReceptionRole = (role) => {

    return RECEPTION_ROLES.includes(
        normalizeRole(role)
    );
};


// ============================================================
// REQUEST ADMIN
// ============================================================

const getAdminFromReq = (req) => {

    return (
        req.admin ||
        null
    );
};


// ============================================================
// REQUEST ROLE CHECKS
// ============================================================

const isMainAdminRequest = (req) => {

    const admin =
        getAdminFromReq(req);

    return isMainAdminRole(
        req.adminRole ||
        admin.role
    );
};


const isReceptionRequest = (req) => {

    const admin =
        getAdminFromReq(req);

    return isReceptionRole(
        req.adminRole ||
        admin.role
    );
};


// ============================================================
// RESOLVE ADMIN BRANCHES
// ============================================================
//
// Main Admin:
//     Kalyanpur + Gopalpur
//
// Receptionist / Staff:
//     gymBranches
//
// Legacy fallback:
//     gymBranch
// ============================================================

const resolveAdminBranches = (admin) => {

    if (!admin) {
        return [];
    }

    // --------------------------------------------------------
    // Main Admin
    // --------------------------------------------------------

    if (
        isMainAdminRole(
            admin.role
        )
    ) {

        return [
            ...VALID_BRANCHES,
        ];
    }

    // --------------------------------------------------------
    // Modern multi-branch field
    // --------------------------------------------------------

    const storedBranches =
        normalizeBranches(
            admin.gymBranches
        );

    if (
        storedBranches.length > 0
    ) {

        return storedBranches;
    }

    // --------------------------------------------------------
    // Legacy single-branch field
    // --------------------------------------------------------

    const legacyBranch =
        normalizeBranch(
            admin.gymBranch
        );

    if (
        legacyBranch
    ) {

        return [
            legacyBranch,
        ];
    }

    return [];
};


// ============================================================
// GET REQUESTED BRANCH
// ============================================================
//
// Priority:
// 1. Header
// 2. Query string
// 3. Request body
// 4. Route params
//
// Examples:
//
// x-gym-branch: Kalyanpur
//
// ?gymBranch=Gopalpur
//
// body:
// {
//     gymBranch: "Gopalpur"
// }
// ============================================================

const getRequestedBranch = (req) => {

    if (!req) {
        return null;
    }

    const requestedValue =
        (
            req.headers &&
            req.headers['x-gym-branch']
        ) ||
        (
            req.query &&
            req.query.gymBranch
        ) ||
        (
            req.query &&
            req.query.branch
        ) ||
        (
            req.body &&
            req.body.gymBranch
        ) ||
        (
            req.params &&
            req.params.gymBranch
        ) ||
        null;

    return normalizeBranch(
        requestedValue
    );
};


// ============================================================
// GET ACCESSIBLE BRANCHES
// ============================================================
//
// req.adminBranches is preferred because authMiddleware has
// already verified those branches.
//
// Otherwise resolve them directly from req.admin.
// ============================================================

const getAccessibleBranches = (req) => {

    if (
        Array.isArray(
            req.adminBranches
        ) &&
        req.adminBranches.length > 0
    ) {

        return normalizeBranches(
            req.adminBranches
        );
    }

    const admin =
        getAdminFromReq(req);

    if (!admin) {
        return [];
    }

    return resolveAdminBranches(
        admin
    );
};


// ============================================================
// GET ACTIVE BRANCH
// ============================================================
//
// Main Admin:
// - requested branch if supplied
// - otherwise null = all branches
//
// Receptionist / Staff:
// - requested accessible branch
// - otherwise middleware-selected branch
// - otherwise first assigned branch
//
// NOTE:
// This helper is primarily for READ operations.
// Write operations use resolveWriteBranch().
// ============================================================

const getActiveBranch = (req) => {

    const accessible =
        getAccessibleBranches(req);

    const requested =
        getRequestedBranch(req);

    // --------------------------------------------------------
    // Main Admin
    // --------------------------------------------------------

    if (
        isMainAdminRequest(req)
    ) {

        if (
            requested &&
            accessible.includes(requested)
        ) {

            return requested;
        }

        if (
            req.adminBranch &&
            accessible.includes(
                normalizeBranch(
                    req.adminBranch
                )
            )
        ) {

            return normalizeBranch(
                req.adminBranch
            );
        }

        return null;
    }

    // --------------------------------------------------------
    // Branch user
    // --------------------------------------------------------

    if (
        requested &&
        accessible.includes(requested)
    ) {

        return requested;
    }

    // --------------------------------------------------------
    // Middleware-selected branch
    // --------------------------------------------------------

    const attached =
        normalizeBranch(
            req.adminBranch
        );

    if (
        attached &&
        accessible.includes(attached)
    ) {

        return attached;
    }

    // --------------------------------------------------------
    // One assigned branch
    // --------------------------------------------------------

    if (
        accessible.length === 1
    ) {

        return accessible[0];
    }

    // --------------------------------------------------------
    // Multiple assigned branches
    //
    // For READ operations, use the first branch as a
    // safe fallback only when middleware has not selected
    // anything.
    // --------------------------------------------------------

    return accessible[0] || null;
};


// ============================================================
// GET BRANCH FILTER
// ============================================================
//
// Main Admin + selected branch:
//     { gymBranch: "Kalyanpur" }
//
// Main Admin + no branch:
//     {}
//
// Receptionist + one branch:
//     { gymBranch: "Kalyanpur" }
//
// Receptionist + multiple branches:
//     { gymBranch: { $in: [...] } }
// ============================================================

const getBranchFilter = (req) => {

    const accessible =
        getAccessibleBranches(req);

    const active =
        getActiveBranch(req);

    // --------------------------------------------------------
    // Active branch selected
    // --------------------------------------------------------

    if (
        active
    ) {

        return {
            gymBranch: active,
        };
    }

    // --------------------------------------------------------
    // Main Admin without selected branch
    // --------------------------------------------------------

    if (
        isMainAdminRequest(req)
    ) {

        return {};
    }

    // --------------------------------------------------------
    // No access
    // --------------------------------------------------------

    if (
        accessible.length === 0
    ) {

        return {
            gymBranch: '__none__',
        };
    }

    // --------------------------------------------------------
    // One assigned branch
    // --------------------------------------------------------

    if (
        accessible.length === 1
    ) {

        return {
            gymBranch: accessible[0],
        };
    }

    // --------------------------------------------------------
    // Multiple assigned branches
    // --------------------------------------------------------

    return {
        gymBranch: {
            $in: accessible,
        },
    };
};


// ============================================================
// RESOLVE WRITE BRANCH
// ============================================================
//
// IMPORTANT:
//
// Main Admin:
// - MUST explicitly select a real branch.
//
// Receptionist / Staff:
// - Can use requested accessible branch.
// - If one branch is assigned, it is automatic.
// - If multiple branches are assigned, an explicit branch
//   must be selected.
//
// This prevents records from accidentally being created in
// the wrong branch.
// ============================================================

const resolveWriteBranch = (
    req,
    requestedBranch
) => {

    if (!getAdminFromReq(req)) {

        return {
            error: 'Not authorized.',
            status: 401,
        };
    }

    const accessible =
        getAccessibleBranches(req);

    const explicitlyRequested =
        normalizeBranch(
            requestedBranch
        ) ||
        getRequestedBranch(req);

    // --------------------------------------------------------
    // MAIN ADMIN
    // --------------------------------------------------------

    if (
        isMainAdminRequest(req)
    ) {

        if (!explicitlyRequested) {

            return {
                error: 'Select Kalyanpur or Gopalpur before creating a record.',
                status: 400,
            };
        }

        if (!VALID_BRANCHES.includes(
                explicitlyRequested
            )) {

            return {
                error: 'Invalid gym branch.',
                status: 400,
            };
        }

        return {
            branch: explicitlyRequested,
        };
    }

    // --------------------------------------------------------
    // RECEPTIONIST / STAFF
    // --------------------------------------------------------

    if (!isReceptionRequest(req)) {

        return {
            error: 'You do not have permission to manage this gym branch.',
            status: 403,
        };
    }

    // --------------------------------------------------------
    // No branch assigned
    // --------------------------------------------------------

    if (
        accessible.length === 0
    ) {

        return {
            error: 'Your account is not assigned to a valid gym branch.',
            status: 403,
        };
    }

    // --------------------------------------------------------
    // Explicit branch
    // --------------------------------------------------------

    if (
        explicitlyRequested
    ) {

        if (!accessible.includes(
                explicitlyRequested
            )) {

            return {
                error: 'Access denied. You cannot access another gym branch.',
                status: 403,
            };
        }

        return {
            branch: explicitlyRequested,
        };
    }

    // --------------------------------------------------------
    // One assigned branch
    // --------------------------------------------------------

    if (
        accessible.length === 1
    ) {

        return {
            branch: accessible[0],
        };
    }

    // --------------------------------------------------------
    // Multiple assigned branches
    //
    // Do NOT silently choose the first branch when writing.
    // --------------------------------------------------------

    return {
        error: 'Select Kalyanpur or Gopalpur before creating a record.',
        status: 400,
    };
};


// ============================================================
// STAFF BRANCH MATCH
// ============================================================

const staffMatchesBranch = (
    staff,
    branch
) => {

    const target =
        normalizeBranch(branch);

    // No valid target means no filtering requested.
    if (!target) {
        return true;
    }

    const assigned = [
        ...normalizeBranches(
            staff.gymBranches
        ),
        normalizeBranch(
            staff.gymBranch
        ),
    ].filter(Boolean);

    return assigned.includes(
        target
    );
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    VALID_BRANCHES,

    MAIN_ADMIN_ROLES,

    RECEPTION_ROLES,

    normalizeRole,

    normalizeBranch,

    normalizeBranches,

    isMainAdminRole,

    isReceptionRole,

    isMainAdminRequest,

    isReceptionRequest,

    resolveAdminBranches,

    getRequestedBranch,

    getAccessibleBranches,

    getActiveBranch,

    getBranchFilter,

    resolveWriteBranch,

    staffMatchesBranch,
};