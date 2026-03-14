import numpy as np

# Joint Indices (H36M)
PELVIS = 0
R_HIP = 1
R_KNEE = 2
R_ANKLE = 3
L_HIP = 4
L_KNEE = 5
L_ANKLE = 6
SPINE = 7
THORAX = 8
NECK = 9
HEAD = 10
L_SHOULDER = 11
L_ELBOW = 12
L_WRIST = 13
R_SHOULDER = 14
R_ELBOW = 15
R_WRIST = 16

# Limb Groups for Energy / Velocity calculations
# Stored as tuples of (start_joint, end_joint)
LIMB_GROUPS = {
    'Trunk': [(PELVIS, SPINE), (SPINE, THORAX), (THORAX, NECK), (NECK, HEAD)],
    'L_Arm': [(L_SHOULDER, L_ELBOW), (L_ELBOW, L_WRIST)],
    'R_Arm': [(R_SHOULDER, R_ELBOW), (R_ELBOW, R_WRIST)],
    'L_Leg': [(L_HIP, L_KNEE), (L_KNEE, L_ANKLE)],
    'R_Leg': [(R_HIP, R_KNEE), (R_KNEE, R_ANKLE)]
}

# Physical Weights
LIMB_WEIGHTS = {
    'Trunk': 0.5,
    'L_Leg': 0.15,
    'R_Leg': 0.15,
    'L_Arm': 0.1,
    'R_Arm': 0.1
}

# Mass Weights for Center of Mass (CoM) calculation
MASS_WEIGHTS = np.zeros(17)
MASS_WEIGHTS[PELVIS] = 0.1
MASS_WEIGHTS[SPINE] = 0.2
MASS_WEIGHTS[THORAX] = 0.05
MASS_WEIGHTS[HEAD] = 0.05
# Add small weights to limbs for more accurate CoM if needed
MASS_WEIGHTS[L_HIP] = MASS_WEIGHTS[R_HIP] = 0.1
MASS_WEIGHTS[L_KNEE] = MASS_WEIGHTS[R_KNEE] = 0.05
MASS_WEIGHTS[L_ANKLE] = MASS_WEIGHTS[R_ANKLE] = 0.02
MASS_WEIGHTS[L_SHOULDER] = MASS_WEIGHTS[R_SHOULDER] = 0.05
MASS_WEIGHTS[L_ELBOW] = MASS_WEIGHTS[R_ELBOW] = 0.03
MASS_WEIGHTS[L_WRIST] = MASS_WEIGHTS[R_WRIST] = 0.01

# Normalize mass weights
MASS_WEIGHTS = MASS_WEIGHTS / np.sum(MASS_WEIGHTS)
