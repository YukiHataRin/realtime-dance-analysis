# AI 叛客 Dance Analysis 指標實作細節與虛擬碼 (Pseudo Code)

本文件詳述了 AI 叛客舞動分析系統中九大指標的計算邏輯、物理權重與實作步驟。

## 0. 基礎配置 (Global Configurations)

在所有計算開始前，定義骨架結構與物理權重。

### 關節索引 (H36M 格式)
- `0: Pelvis`, `1: R_Hip`, `2: R_Knee`, `3: R_Ankle`, `4: L_Hip`, `5: L_Knee`, `6: L_Ankle`
- `7: Spine`, `8: Thorax`, `9: Neck`, `10: Head`
- `11: L_Shoulder`, `12: L_Elbow`, `13: L_Wrist`, `14: R_Shoulder`, `15: R_Elbow`, `16: R_Wrist`

### 物理權重 (Physical Weights)
- **肢體權重 (`LIMB_WEIGHTS`)**: `Trunk: 0.5`, `Legs: 0.15 (each)`, `Arms: 0.1 (each)`
- **關節質量權重 (`MASS_WEIGHTS`)**: 用於重心計算 (CoM)，Pelvis(0.1), Spine(0.2), Thorax(0.05), Head(0.05) 等。

---

## 1. Energy (Intensity) - 動作能量強度

反映舞者的出力程度，採用**肢體向量角速度能量法**。

### 計算邏輯
1. 定義肢體向量 (如 `UpperArm = Joint_12 - Joint_11`)。
2. 計算相鄰兩幀肢體向量的夾角 $\Delta\theta$。
3. 計算角速度 $\omega = \Delta\theta / \Delta t$。
4. 能量 $E = \sum (w_{limb} \cdot \omega^2)$。

### 虛擬碼
```python
FUNCTION CalculateEnergy(Positions, FPS):
    dt = 1 / FPS
    TotalEnergy = Array(n_frames, initial=0)
    
    FOR Group IN LimbGroups (Trunk, L_Arm, R_Arm, L_Leg, R_Leg):
        GroupWeight = LIMB_WEIGHTS[Group]
        GroupEnergy = Array(n_frames, initial=0)
        
        FOR Limb IN Group.Limbs:
            # 1. 取得肢體向量
            V_t = Positions[t, Limb.End] - Positions[t, Limb.Start]
            V_prev = Positions[t-1, Limb.End] - Positions[t-1, Limb.Start]
            
            # 2. 歸一化向量
            Unit_V_t = V_t / Normalize(V_t)
            Unit_V_prev = V_prev / Normalize(V_prev)
            
            # 3. 計算夾角 (內積反餘弦)
            CosTheta = DotProduct(Unit_V_t, Unit_V_prev)
            DeltaTheta = arccos(Clip(CosTheta, -1, 1))
            
            # 4. 計算角速度平方並累加
            OmegaSq = (DeltaTheta / dt)^2
            GroupEnergy += (GroupWeight / NumLimbsInGroup) * OmegaSq
            
        TotalEnergy += GroupEnergy
        
    RETURN TotalEnergy
```

---

## 2 & 3. Synchronization (Velocity & Correlation) - 左右同步性

分析身體左右側的動作對稱與相關程度。

### 計算邏輯
1. 分別計算左半身與右半身所有肢體的角速度總和 ($\Omega_L, \Omega_R$)。
2. 計算 $\Omega_L$ 與 $\Omega_R$ 在滾動窗口內的皮爾森相關係數 (Pearson Correlation)。

### 虛擬碼
```python
FUNCTION CalculateSync(Positions, FPS):
    # 1. 計算左右角速度序列
    Omega_L = CalculateGroupAngularVelocity(Positions, LeftGroup, FPS)
    Omega_R = CalculateGroupAngularVelocity(Positions, RightGroup, FPS)
    
    # 2. 計算滾動相關係數 (窗口大小預設為 1 秒)
    WindowSize = FPS
    SyncCorrelation = RollingPearson(Omega_L, Omega_R, WindowSize)
    
    # Correlation 範圍 [-1, 1]
    # +1: 完全同步 (Unison)
    # -1: 鏡像/對立 (Opposition)
    RETURN Omega_L, Omega_R, SyncCorrelation
```

---

## 4. Body Geometry - Expansion (Volume) - 空間佔積

反映動作的開展度與肢體擴張。

### 計算邏輯
使用 17 個關節點在三維空間中的座標，計算其**凸包 (Convex Hull)** 的體積。

### 虛擬碼
```python
FUNCTION CalculateExpansion(Positions):
    Volumes = Array(n_frames)
    FOR t IN range(n_frames):
        FramePoints = Positions[t, 0:17] # 所有 17 個點
        # 使用 Scipy ConvexHull 或類似演算法
        Volumes[t] = ComputeConvexHullVolume(FramePoints)
    RETURN Volumes
```

---

## 5. Body Geometry - Roundness (Curvature) - 動作圓滑度

分析手腕與腳踝運動軌跡的曲率。

### 計算邏輯
1. 提取末梢關節 (Wrist, Ankle) 的軌跡 $P(t)$。
2. 計算速度 $v(t) = \dot{P}(t)$ 與加速度 $a(t) = \ddot{P}(t)$。
3. 曲率 $\kappa = \frac{\|v \times a\|}{\|v\|^3}$。

### 虛擬碼
```python
FUNCTION CalculateCurvature(Positions, FPS):
    EndEffectors = [L_Wrist, R_Wrist, L_Ankle, R_Ankle]
    TotalCurvature = Array(n_frames)
    
    FOR Joint IN EndEffectors:
        Path = Positions[:, Joint]
        V = Derivative(Path, dt)
        A = Derivative(V, dt)
        
        # 軌跡曲率公式
        CrossProd = CrossProduct(V, A)
        K = Magnitude(CrossProd) / (Magnitude(V)^3 + epsilon)
        TotalCurvature += K / NumEndEffectors
        
    RETURN TotalCurvature
```

---

## 6 & 7. Stability (Height & Sway) - 穩定性與重心

分析身體重心的垂直層次與水平擺盪。

### 計算邏輯
1. 計算重心 (Center of Mass, CoM): $P_{CoM} = \frac{\sum (m_i \cdot P_i)}{\sum m_i}$。
2. Height = $P_{CoM}.z$ (假設 Z 軸為高度)。
3. Sway = $CoM_{xy}$ 投影點與支撐底座 (雙腳中點) 的距離。

### 虛擬碼
```python
FUNCTION CalculateStability(Positions):
    FOR t IN range(n_frames):
        # 1. 計算加權重心 (Center of Mass)
        CoM_t = Sum(Positions[t, i] * MASS_WEIGHTS[i]) / Sum(MASS_WEIGHTS)
        
        # 2. 提取高度
        Height[t] = CoM_t.z
        
        # 3. 計算支撐中心 (Base of Support) - 雙腳中點
        BoS_t = (Positions[t, L_Ankle] + Positions[t, R_Ankle]) / 2
        
        # 4. 計算水平擺盪 (歐幾里德距離)
        Sway[t] = DistanceXY(CoM_t, BoS_t)
        
    RETURN Height, Sway
```

---

## 8 & 9. Transition (Torque & Jerk) - 動作過渡與平滑代價

分析改變動作狀態所需的力矩 (Effort) 與急促程度 (Smoothness)。

### 計算邏輯
1. 基於角速度 $\omega$，計算角加速度 $\alpha = \dot{\omega}$。
2. 基於角加速度 $\alpha$，計算角急動度 $\zeta = \dot{\alpha}$。
3. Torque (Effort) $\approx \sum (w \cdot |\alpha|)$。
4. Jerk (Smoothness Cost) $\approx \sum (w \cdot \zeta^2)$。

### 虛擬碼
```python
FUNCTION CalculateTransition(Positions, FPS):
    # 1. 取得所有肢體的角速度序列 (見 Energy 算法)
    Omegas = GetLimbAngularVelocities(Positions, FPS) 
    
    # 2. 計算導數
    Alphas = Derivative(Omegas, dt)  # 角加速度
    Jerks = Derivative(Alphas, dt)  # 角急動度
    
    # 3. 加權總和
    Torque = SumOverLimbs(LIMB_WEIGHTS * Abs(Alphas))
    JerkCost = SumOverLimbs(LIMB_WEIGHTS * (Jerks^2))
    
    RETURN Torque, JerkCost
```
