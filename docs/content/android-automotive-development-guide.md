# Android Automotive 开发完整指南

> **作者**: 智云科技技术团队  
> **发布时间**: 2024年7月  
> **标签**: `Android Automotive OS` `车载开发` `移动开发` `汽车技术`

---

## 🚗 引言

Android Automotive OS (AAOS) 是Google专为汽车设计的Android平台，它不同于Android Auto，而是直接运行在车载信息娱乐系统上的操作系统。随着智能汽车的快速发展，AAOS正成为车载应用开发的重要平台。

本指南将从零开始，带你掌握Android Automotive开发的核心技术和最佳实践。

---

## 📋 目录

1. [Android Automotive 概述](#1-android-automotive-概述)
2. [开发环境搭建](#2-开发环境搭建)
3. [核心架构理解](#3-核心架构理解)
4. [应用类型与开发模式](#4-应用类型与开发模式)
5. [车载UI/UX设计原则](#5-车载uiux设计原则)
6. [核心API与服务](#6-核心api与服务)
7. [实战案例：音乐播放器](#7-实战案例音乐播放器)
8. [性能优化与最佳实践](#8-性能优化与最佳实践)
9. [测试与调试](#9-测试与调试)
10. [发布与部署](#10-发布与部署)

---

## 1. Android Automotive 概述

### 1.1 什么是Android Automotive OS

Android Automotive OS是Google基于Android开发的车载操作系统，具有以下特点：

- **原生车载系统**: 直接运行在汽车硬件上，而非手机投屏
- **深度集成**: 与车辆控制系统、传感器深度集成
- **安全第一**: 针对驾驶场景优化的安全设计
- **Google服务**: 集成Google Assistant、Maps等服务

### 1.2 与Android Auto的区别

| 特性 | Android Automotive OS | Android Auto |
|------|----------------------|--------------|
| 运行方式 | 车载原生系统 | 手机投屏 |
| 硬件依赖 | 车载硬件 | 智能手机 |
| 系统集成 | 深度集成车辆功能 | 有限访问 |
| 开发复杂度 | 高 | 中等 |
| 用户体验 | 原生车载体验 | 手机体验映射 |

### 1.3 支持的车型与厂商

目前支持AAOS的主要汽车厂商包括：
- **沃尔沃** (XC40 Recharge, C40 Recharge)
- **极星** (Polestar 2, Polestar 3)
- **福特** (Mustang Mach-E 部分版本)
- **通用汽车** (凯迪拉克 Lyriq)
- **雷诺日产** (部分新车型)

---

## 2. 开发环境搭建

### 2.1 系统要求

**开发机器要求:**
- **操作系统**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **内存**: 最少8GB，推荐16GB+
- **存储**: 至少50GB可用空间
- **CPU**: 64位处理器，支持虚拟化

### 2.2 开发工具安装

#### 2.2.1 Android Studio安装

```bash
# 1. 下载Android Studio (最新版本)
# https://developer.android.com/studio

# 2. 安装Android Automotive系统映像
# SDK Manager > SDK Platforms > Android API 33 (Automotive)
```

#### 2.2.2 Automotive模拟器配置

```bash
# 创建Automotive AVD (Android Virtual Device)
# Tools > AVD Manager > Create Virtual Device > Automotive

# 推荐配置:
# - 系统映像: Android 13 (API 33) Automotive
# - RAM: 4GB+
# - 内部存储: 32GB+
# - 硬件加速: 启用
```

#### 2.2.3 开发者选项启用

在车载设备或模拟器上启用开发者选项：

```xml
<!-- 连续点击版本号7次启用开发者选项 -->
设置 > 关于 > 连续点击"版本号"

<!-- 启用关键选项 -->
开发者选项 > USB调试
开发者选项 > 保持唤醒状态
开发者选项 > 允许未知来源
```

### 2.3 项目初始化

#### 2.3.1 创建Automotive项目

```kotlin
// 1. 新建项目时选择 "Automotive" 模板
// File > New > New Project > Automotive > No Activity

// 2. 配置项目
applicationId "com.zhiyuntech.automotive.demo"
minSdk 28  // Automotive最低支持API 28
targetSdk 33
compileSdk 33
```

#### 2.3.2 关键配置文件

**AndroidManifest.xml 配置:**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- 声明这是一个车载应用 -->
    <uses-feature
        android:name="android.hardware.type.automotive"
        android:required="true" />
        
    <!-- 车载权限 -->
    <uses-permission android:name="android.car.permission.CAR_INFO" />
    <uses-permission android:name="android.car.permission.CAR_ENERGY" />
    <uses-permission android:name="android.car.permission.READ_CAR_DISPLAY_UNITS" />
    
    <application
        android:label="@string/app_name"
        android:theme="@style/Theme.Car.Light">
        
        <!-- 主Activity配置 -->
        <activity 
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
    </application>
</manifest>
```

**build.gradle (Module) 配置:**

```kotlin
dependencies {
    // Automotive核心库
    implementation 'androidx.car.app:app:1.3.0'
    implementation 'androidx.car.app:app-automotive:1.3.0'
    
    // 车载UI组件
    implementation 'androidx.car.app:app-templates:1.3.0'
    
    // 多媒体支持
    implementation 'androidx.media:media:1.6.0'
    implementation 'androidx.media3:media3-session:1.1.1'
    
    // 车载专用导航
    implementation 'androidx.car.app:app-navigation:1.3.0'
}
```

---

## 3. 核心架构理解

### 3.1 AAOS系统架构

```
┌─────────────────────────────────────┐
│           应用层 (App Layer)          │
├─────────────────────────────────────┤
│     Car App Library (车载应用库)      │
├─────────────────────────────────────┤
│       Car Service (车载服务)         │
├─────────────────────────────────────┤
│     Android Framework (Android框架)  │
├─────────────────────────────────────┤
│         HAL Layer (硬件抽象层)        │
├─────────────────────────────────────┤
│       Vehicle Hardware (车载硬件)     │
└─────────────────────────────────────┘
```

### 3.2 Car App Library核心组件

#### 3.2.1 CarAppService

```kotlin
class MyCarAppService : CarAppService() {
    override fun createHostValidator(): HostValidator {
        return HostValidator.Builder(applicationContext)
            .setAllowedHosts(HostValidator.ALLOW_ALL_HOSTS_VALIDATOR)
            .build()
    }

    override fun onCreateSession(): Session {
        return MySession()
    }
}

class MySession : Session() {
    override fun onCreateScreen(intent: Intent): Screen {
        return MainScreen(carContext)
    }

    override fun onNewIntent(intent: Intent) {
        // 处理新的Intent
        screenManager.push(MainScreen(carContext))
    }
}
```

#### 3.2.2 Screen管理

```kotlin
class MainScreen(carContext: CarContext) : Screen(carContext) {
    
    override fun onGetTemplate(): Template {
        return PaneTemplate.Builder(createPane())
            .setHeaderAction(Action.APP_ICON)
            .setActionStrip(createActionStrip())
            .build()
    }
    
    private fun createPane(): Pane {
        return Pane.Builder()
            .addRow(createMusicRow())
            .addRow(createNavigationRow())
            .addRow(createSettingsRow())
            .build()
    }
    
    private fun createMusicRow(): Row {
        return Row.Builder()
            .setTitle("音乐播放")
            .setImage(CarIcon.of(IconCompat.createWithResource(
                carContext, R.drawable.ic_music)))
            .setOnClickListener { 
                screenManager.push(MusicScreen(carContext))
            }
            .build()
    }
}
```

### 3.3 生命周期管理

```kotlin
class MusicScreen(carContext: CarContext) : Screen(carContext) {
    
    override fun onCreate(owner: LifecycleOwner) {
        super.onCreate(owner)
        // 初始化音频播放器
        initializeMediaPlayer()
    }
    
    override fun onStart(owner: LifecycleOwner) {
        super.onStart(owner)
        // 开始监听车载事件
        registerCarEventListeners()
    }
    
    override fun onResume(owner: LifecycleOwner) {
        super.onResume(owner)
        // 恢复音频焦点
        requestAudioFocus()
    }
    
    override fun onPause(owner: LifecycleOwner) {
        super.onPause(owner)
        // 暂停播放，释放音频焦点
        pausePlayback()
        abandonAudioFocus()
    }
    
    override fun onStop(owner: LifecycleOwner) {
        super.onStop(owner)
        // 取消注册车载事件监听
        unregisterCarEventListeners()
    }
    
    override fun onDestroy(owner: LifecycleOwner) {
        super.onDestroy(owner)
        // 清理资源
        releaseMediaPlayer()
    }
}
```

---

## 4. 应用类型与开发模式

### 4.1 应用类型分类

#### 4.1.1 媒体应用 (Media Apps)

**特点:**
- 音频/视频播放功能
- 媒体控制界面
- 支持语音控制
- 后台播放能力

**开发要点:**
```kotlin
class MusicCarAppService : CarAppService() {
    override fun onCreateSession(): Session {
        return MediaSession()
    }
}

class MediaSession : Session() {
    private lateinit var mediaSessionCallback: MediaSessionCallback
    
    override fun onCreateScreen(intent: Intent): Screen {
        return MediaScreen(carContext)
    }
    
    override fun onCreate(owner: LifecycleOwner) {
        super.onCreate(owner)
        
        // 创建MediaSession
        val mediaSession = MediaSessionCompat(carContext, "MusicSession")
        mediaSession.setCallback(mediaSessionCallback)
        mediaSession.isActive = true
    }
}
```

#### 4.1.2 导航应用 (Navigation Apps)

**特点:**
- 地图显示与导航
- 路径规划
- 实时路况
- 语音导航

**开发要点:**
```kotlin
class NavigationScreen(carContext: CarContext) : Screen(carContext) {
    
    override fun onGetTemplate(): Template {
        return NavigationTemplate.Builder()
            .setNavigationInfo(createNavigationInfo())
            .setDestinationTravelEstimate(createTravelEstimate())
            .setActionStrip(createNavigationActionStrip())
            .build()
    }
    
    private fun createNavigationInfo(): NavigationInfo {
        return NavigationInfo.Builder()
            .setCurrentStep(createCurrentStep())
            .setJunctionImage(createJunctionImage())
            .build()
    }
}
```

#### 4.1.3 通信应用 (Communication Apps)

**特点:**
- 电话/短信功能
- 联系人管理
- 免提通话
- 语音助手集成

#### 4.1.4 点餐和停车应用 (POI Apps)

**特点:**
- 地点搜索
- 在线订单
- 支付集成
- 车载显示优化

### 4.2 开发模式选择

#### 4.2.1 Car App Library模式

**适用场景:**
- 需要深度车载集成
- 复杂的车载专用功能
- 高性能要求

**优点:**
- 原生车载体验
- 完整的车载API访问
- 优化的安全性和可用性

**缺点:**
- 开发复杂度高
- 学习曲线陡峭
- 兼容性测试复杂

#### 4.2.2 Adaptive App模式

**适用场景:**
- 需要跨平台兼容
- 快速原型开发
- 简单功能应用

**优点:**
- 开发效率高
- 代码复用率高
- 易于维护

**缺点:**
- 车载特性支持有限
- 性能相对较低
- 用户体验一般

---

## 5. 车载UI/UX设计原则

### 5.1 驾驶安全第一

#### 5.1.1 注意力管理原则

**2秒规则:**
- 任何操作不应超过2秒注意力离开道路
- 复杂操作需要分步骤完成
- 支持语音替代操作

**设计实现:**
```kotlin
class SafetyAwareScreen(carContext: CarContext) : Screen(carContext) {
    
    override fun onGetTemplate(): Template {
        return ListTemplate.Builder()
            .setSingleList(createSafeItemList())
            .setHeaderAction(Action.BACK)
            .setActionStrip(createVoiceActionStrip()) // 提供语音操作
            .build()
    }
    
    private fun createSafeItemList(): ItemList {
        return ItemList.Builder()
            .addItem(createSimpleItem("选项1", ::onItem1Click))
            .addItem(createSimpleItem("选项2", ::onItem2Click))
            .setNoItemsMessage("请使用语音命令") // 空状态提示语音操作
            .build()
    }
    
    private fun createSimpleItem(title: String, onClick: () -> Unit): Item {
        return Item.Builder()
            .setTitle(title)
            .setOnClickListener(onClick)
            // 避免复杂的子菜单，保持简单
            .build()
    }
}
```

#### 5.1.2 手势控制限制

**允许的手势:**
- 简单点击
- 短距离滑动
- 物理按钮操作

**禁止的手势:**
- 复杂的多点触控
- 长距离滑动
- 精细操作

### 5.2 车载UI组件设计

#### 5.2.1 模板系统

**ListTemplate - 列表模板:**
```kotlin
fun createMusicListTemplate(): ListTemplate {
    return ListTemplate.Builder()
        .setSingleList(
            ItemList.Builder()
                .addItem(createSongItem("夜曲", "周杰伦"))
                .addItem(createSongItem("告白气球", "周杰伦"))
                .addItem(createSongItem("青花瓷", "周杰伦"))
                .build()
        )
        .setTitle("我的音乐")
        .setHeaderAction(Action.BACK)
        .setActionStrip(createMusicActionStrip())
        .build()
}

private fun createSongItem(title: String, artist: String): Item {
    return Item.Builder()
        .setTitle(title)
        .addText(artist)
        .setImage(CarIcon.of(IconCompat.createWithResource(
            carContext, R.drawable.ic_music)))
        .setOnClickListener { playSong(title) }
        .build()
}
```

**GridTemplate - 网格模板:**
```kotlin
fun createAppGridTemplate(): GridTemplate {
    return GridTemplate.Builder()
        .setSingleList(
            ItemList.Builder()
                .addItem(createGridItem("音乐", R.drawable.ic_music, ::openMusic))
                .addItem(createGridItem("导航", R.drawable.ic_navigation, ::openNavigation))
                .addItem(createGridItem("电话", R.drawable.ic_phone, ::openPhone))
                .addItem(createGridItem("设置", R.drawable.ic_settings, ::openSettings))
                .build()
        )
        .setTitle("应用中心")
        .setHeaderAction(Action.APP_ICON)
        .build()
}
```

#### 5.2.2 色彩与字体

**车载主题配色:**
```xml
<!-- res/values/colors.xml -->
<resources>
    <!-- 主色调 - 深色背景为主 -->
    <color name="car_primary_dark">#1A1A1A</color>
    <color name="car_surface_dark">#2C2C2C</color>
    
    <!-- 强调色 - 醒目但不刺眼 -->
    <color name="car_accent_blue">#4CAF50</color>
    <color name="car_accent_orange">#FF9800</color>
    
    <!-- 文字颜色 - 高对比度 -->
    <color name="car_text_primary">#FFFFFF</color>
    <color name="car_text_secondary">#B0B0B0</color>
    
    <!-- 状态颜色 -->
    <color name="car_success">#4CAF50</color>
    <color name="car_warning">#FF9800</color>
    <color name="car_error">#F44336</color>
</resources>
```

**字体大小规范:**
```xml
<!-- res/values/dimens.xml -->
<resources>
    <!-- 车载字体 - 比手机更大 -->
    <dimen name="car_text_size_large">24sp</dimen>
    <dimen name="car_text_size_medium">20sp</dimen>
    <dimen name="car_text_size_normal">18sp</dimen>
    <dimen name="car_text_size_small">16sp</dimen>
    
    <!-- 触摸目标 - 最小48dp -->
    <dimen name="car_touch_target_min">48dp</dimen>
    <dimen name="car_touch_target_recommended">56dp</dimen>
    
    <!-- 间距 -->
    <dimen name="car_spacing_large">24dp</dimen>
    <dimen name="car_spacing_medium">16dp</dimen>
    <dimen name="car_spacing_small">8dp</dimen>
</resources>
```

### 5.3 语音交互设计

#### 5.3.1 语音命令支持

```kotlin
class VoiceInteractionHelper(private val carContext: CarContext) {
    
    fun setupVoiceCommands() {
        val constraints = Constraints.Builder()
            .setRequiresNetwork(false)
            .build()
            
        carContext.getCarService(AppManager::class.java)
            .setSurfaceCallback(object : SurfaceCallback {
                override fun onSurfaceAvailable(surfaceContainer: SurfaceContainer) {
                    // 设置语音命令
                    setupMusicVoiceCommands()
                    setupNavigationVoiceCommands()
                }
                
                override fun onSurfaceDestroyed(surfaceContainer: SurfaceContainer) {
                    // 清理语音命令
                }
            })
    }
    
    private fun setupMusicVoiceCommands() {
        // 音乐相关语音命令
        val musicCommands = listOf(
            "播放音乐",
            "暂停音乐", 
            "下一首",
            "上一首",
            "播放周杰伦的歌"
        )
        
        // 注册语音命令处理
        registerVoiceCommands(musicCommands) { command ->
            when {
                command.contains("播放") -> handlePlayCommand(command)
                command.contains("暂停") -> handlePauseCommand()
                command.contains("下一首") -> handleNextCommand()
                command.contains("上一首") -> handlePreviousCommand()
            }
        }
    }
}
```

#### 5.3.2 文本转语音(TTS)

```kotlin
class TTSManager(private val context: Context) {
    private var tts: TextToSpeech? = null
    
    fun initialize() {
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.language = Locale.CHINESE
                tts?.setSpeechRate(0.8f) // 稍慢语速，适合驾驶场景
            }
        }
    }
    
    fun speak(text: String, priority: Int = TextToSpeech.QUEUE_FLUSH) {
        if (isDrivingMode()) {
            tts?.speak(text, priority, null, null)
        }
    }
    
    fun announceNavigation(instruction: String) {
        speak("导航提示：$instruction", TextToSpeech.QUEUE_ADD)
    }
    
    fun announceMediaChange(songTitle: String, artist: String) {
        speak("正在播放：$artist 的 $songTitle", TextToSpeech.QUEUE_FLUSH)
    }
}
```

---

## 6. 核心API与服务

### 6.1 Car API概览

#### 6.1.1 CarInfo API - 车辆信息

```kotlin
class CarInfoManager(private val car: Car) {
    private lateinit var carInfoManager: android.car.CarInfoManager
    
    fun initialize() {
        carInfoManager = car.getCarManager(Car.INFO_SERVICE) as android.car.CarInfoManager
    }
    
    fun getVehicleInfo(): VehicleInfo {
        return VehicleInfo(
            manufacturer = carInfoManager.manufacturer ?: "Unknown",
            model = carInfoManager.model ?: "Unknown", 
            modelYear = carInfoManager.modelYear ?: 0,
            fuelType = getFuelType(),
            evConnectorTypes = getEvConnectorTypes()
        )
    }
    
    private fun getFuelType(): FuelType {
        return try {
            val fuelTypes = carInfoManager.fuelTypes
            when {
                fuelTypes.contains(FuelType.ELECTRIC) -> FuelType.ELECTRIC
                fuelTypes.contains(FuelType.GASOLINE) -> FuelType.GASOLINE
                fuelTypes.contains(FuelType.HYBRID) -> FuelType.HYBRID
                else -> FuelType.UNKNOWN
            }
        } catch (e: CarNotConnectedException) {
            FuelType.UNKNOWN
        }
    }
}

data class VehicleInfo(
    val manufacturer: String,
    val model: String,
    val modelYear: Int,
    val fuelType: FuelType,
    val evConnectorTypes: List<Int>
)
```

#### 6.1.2 CarSensors API - 传感器数据

```kotlin
class CarSensorsManager(private val car: Car) {
    private lateinit var carSensorManager: CarSensorManager
    private val sensorListeners = mutableMapOf<Int, CarSensorEventListener>()
    
    fun initialize() {
        carSensorManager = car.getCarManager(Car.SENSOR_SERVICE) as CarSensorManager
        setupSensorListeners()
    }
    
    private fun setupSensorListeners() {
        // 车速监听
        registerSpeedListener()
        
        // 燃料监听
        registerFuelListener()
        
        // 档位监听
        registerGearListener()
    }
    
    private fun registerSpeedListener() {
        val listener = object : CarSensorEventListener {
            override fun onSensorChanged(event: CarSensorEvent) {
                if (event.sensorType == CarSensorManager.SENSOR_TYPE_CAR_SPEED) {
                    val speed = event.floatValues[0] // km/h
                    onSpeedChanged(speed)
                }
            }
        }
        
        try {
            carSensorManager.registerListener(
                listener,
                CarSensorManager.SENSOR_TYPE_CAR_SPEED,
                CarSensorManager.SENSOR_RATE_NORMAL
            )
            sensorListeners[CarSensorManager.SENSOR_TYPE_CAR_SPEED] = listener
        } catch (e: CarNotConnectedException) {
            Log.e("CarSensors", "Failed to register speed listener", e)
        }
    }
    
    private fun onSpeedChanged(speed: Float) {
        // 根据车速调整UI行为
        when {
            speed > 80 -> enableHighSpeedMode()
            speed > 40 -> enableNormalMode()
            speed < 5 -> enableParkingMode()
        }
    }
    
    private fun enableHighSpeedMode() {
        // 高速模式：简化UI，禁用复杂操作
        // 只允许语音操作
    }
    
    private fun enableParkingMode() {
        // 停车模式：启用所有功能
        // 允许复杂操作和设置
    }
}
```

#### 6.1.3 CarAudio API - 音频管理

```kotlin
class CarAudioManager(private val car: Car) {
    private lateinit var carAudioManager: android.car.media.CarAudioManager
    private var currentAudioFocus: Int = AudioManager.AUDIOFOCUS_NONE
    
    fun initialize() {
        carAudioManager = car.getCarManager(Car.AUDIO_SERVICE) as android.car.media.CarAudioManager
    }
    
    fun requestAudioFocus(
        usage: Int = AudioAttributes.USAGE_MEDIA,
        contentType: Int = AudioAttributes.CONTENT_TYPE_MUSIC
    ): Boolean {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(usage)
            .setContentType(contentType)
            .build()
            
        val focusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
            .setAudioAttributes(audioAttributes)
            .setOnAudioFocusChangeListener { focusChange ->
                handleAudioFocusChange(focusChange)
            }
            .build()
            
        val result = carAudioManager.requestAudioFocus(focusRequest)
        return result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
    }
    
    private fun handleAudioFocusChange(focusChange: Int) {
        currentAudioFocus = focusChange
        when (focusChange) {
            AudioManager.AUDIOFOCUS_GAIN -> {
                // 获得音频焦点，恢复播放
                resumePlayback()
            }
            AudioManager.AUDIOFOCUS_LOSS -> {
                // 永久失去焦点，停止播放
                stopPlayback()
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                // 临时失去焦点，暂停播放
                pausePlayback()
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> {
                // 降低音量继续播放
                duckPlayback()
            }
        }
    }
    
    fun getAudioZones(): List<CarAudioZone> {
        return try {
            carAudioManager.audioZones
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    fun setVolumeForZone(zoneId: Int, groupId: Int, volume: Int) {
        try {
            carAudioManager.setGroupVolume(zoneId, groupId, volume, 0)
        } catch (e: Exception) {
            Log.e("CarAudio", "Failed to set volume", e)
        }
    }
}
```

### 6.2 权限管理

#### 6.2.1 车载权限申请

```kotlin
class CarPermissionManager(private val context: Context) {
    
    companion object {
        val REQUIRED_PERMISSIONS = arrayOf(
            Car.PERMISSION_CAR_INFO,
            Car.PERMISSION_CAR_ENERGY,
            Car.PERMISSION_READ_CAR_DISPLAY_UNITS,
            Car.PERMISSION_ENERGY_PORTS,
            Car.PERMISSION_CAR_POWERTRAIN
        )
        
        val OPTIONAL_PERMISSIONS = arrayOf(
            Car.PERMISSION_CAR_SPEED,
            Car.PERMISSION_CAR_ENGINE_DETAILED,
            Car.PERMISSION_CAR_EXTERIOR_ENVIRONMENT
        )
    }
    
    fun checkAndRequestPermissions(activity: ComponentActivity) {
        val permissionsToRequest = mutableListOf<String>()
        
        // 检查必需权限
        REQUIRED_PERMISSIONS.forEach { permission ->
            if (ContextCompat.checkSelfPermission(context, permission) 
                != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(permission)
            }
        }
        
        // 检查可选权限
        OPTIONAL_PERMISSIONS.forEach { permission ->
            if (ContextCompat.checkSelfPermission(context, permission)
                != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(permission)
            }
        }
        
        if (permissionsToRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                activity,
                permissionsToRequest.toTypedArray(),
                REQUEST_CODE_CAR_PERMISSIONS
            )
        }
    }
    
    fun hasRequiredPermissions(): Boolean {
        return REQUIRED_PERMISSIONS.all { permission ->
            ContextCompat.checkSelfPermission(context, permission) 
                == PackageManager.PERMISSION_GRANTED
        }
    }
}
```

---

## 7. 实战案例：音乐播放器

### 7.1 项目结构设计

```
app/
├── src/main/
│   ├── java/com/zhiyuntech/carmusic/
│   │   ├── service/
│   │   │   ├── MusicCarAppService.kt
│   │   │   └── MediaPlaybackService.kt
│   │   ├── screen/
│   │   │   ├── MainScreen.kt
│   │   │   ├── PlaylistScreen.kt
│   │   │   └── PlayerScreen.kt
│   │   ├── data/
│   │   │   ├── MusicRepository.kt
│   │   │   └── model/
│   │   ├── player/
│   │   │   ├── MusicPlayer.kt
│   │   │   └── AudioFocusManager.kt
│   │   └── utils/
│   └── res/
│       ├── layout/
│       ├── drawable/
│       └── values/
```

### 7.2 核心Service实现

#### 7.2.1 CarAppService

```kotlin
class MusicCarAppService : CarAppService() {
    
    override fun createHostValidator(): HostValidator {
        return HostValidator.Builder(applicationContext)
            .setAllowedHosts(HostValidator.ALLOW_ALL_HOSTS_VALIDATOR)
            .build()
    }
    
    override fun onCreateSession(): Session {
        return MusicSession()
    }
    
    inner class MusicSession : Session() {
        private lateinit var musicRepository: MusicRepository
        private lateinit var musicPlayer: MusicPlayer
        
        override fun onCreate(owner: LifecycleOwner) {
            super.onCreate(owner)
            initializeServices()
        }
        
        private fun initializeServices() {
            musicRepository = MusicRepository(carContext)
            musicPlayer = MusicPlayer(carContext)
            
            // 启动媒体播放服务
            val serviceIntent = Intent(carContext, MediaPlaybackService::class.java)
            carContext.startForegroundService(serviceIntent)
        }
        
        override fun onCreateScreen(intent: Intent): Screen {
            return MainScreen(carContext, musicRepository, musicPlayer)
        }
        
        override fun onNewIntent(intent: Intent) {
            val action = intent.action
            when (action) {
                "PLAY_MUSIC" -> {
                    val songId = intent.getStringExtra("song_id")
                    songId?.let { 
                        musicPlayer.playSong(it)
                        screenManager.push(PlayerScreen(carContext, musicPlayer))
                    }
                }
                "OPEN_PLAYLIST" -> {
                    val playlistId = intent.getStringExtra("playlist_id")
                    screenManager.push(PlaylistScreen(carContext, playlistId))
                }
            }
        }
    }
}
```

#### 7.2.2 MediaPlaybackService

```kotlin
class MediaPlaybackService : MediaBrowserServiceCompat() {
    private lateinit var mediaSession: MediaSessionCompat
    private lateinit var mediaPlayer: MediaPlayer
    private lateinit var audioFocusManager: AudioFocusManager
    
    companion object {
        private const val MEDIA_ROOT_ID = "root_id"
        private const val EMPTY_MEDIA_ROOT_ID = "empty_root_id"
    }
    
    override fun onCreate() {
        super.onCreate()
        
        // 初始化MediaSession
        mediaSession = MediaSessionCompat(this, "MusicService")
        sessionToken = mediaSession.sessionToken
        mediaSession.setCallback(MediaSessionCallback())
        mediaSession.setFlags(
            MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or
            MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
        )
        
        // 初始化音频焦点管理
        audioFocusManager = AudioFocusManager(this) { focusState ->
            handleAudioFocusChange(focusState)
        }
        
        // 初始化媒体播放器
        initializeMediaPlayer()
    }
    
    private fun initializeMediaPlayer() {
        mediaPlayer = MediaPlayer().apply {
            setOnPreparedListener {
                // 播放器准备就绪
                if (audioFocusManager.requestFocus()) {
                    start()
                    updatePlaybackState(PlaybackStateCompat.STATE_PLAYING)
                }
            }
            
            setOnCompletionListener {
                // 播放完成，播放下一首
                playNextSong()
            }
            
            setOnErrorListener { _, what, extra ->
                Log.e("MediaPlayer", "Error: $what, $extra")
                updatePlaybackState(PlaybackStateCompat.STATE_ERROR)
                true
            }
        }
    }
    
    override fun onGetRoot(
        clientPackageName: String,
        clientUid: Int,
        rootHints: Bundle?
    ): BrowserRoot {
        // 验证客户端权限
        return if (isValidClient(clientPackageName, clientUid)) {
            BrowserRoot(MEDIA_ROOT_ID, null)
        } else {
            BrowserRoot(EMPTY_MEDIA_ROOT_ID, null)
        }
    }
    
    override fun onLoadChildren(
        parentId: String,
        result: Result<MutableList<MediaBrowserCompat.MediaItem>>
    ) {
        when (parentId) {
            MEDIA_ROOT_ID -> {
                // 加载音乐库
                loadMusicLibrary(result)
            }
            EMPTY_MEDIA_ROOT_ID -> {
                result.sendResult(mutableListOf())
            }
            else -> {
                // 加载特定播放列表
                loadPlaylist(parentId, result)
            }
        }
    }
    
    private fun loadMusicLibrary(result: Result<MutableList<MediaBrowserCompat.MediaItem>>) {
        // 异步加载音乐库
        Thread {
            val musicItems = MusicRepository.getAllMusic().map { song ->
                MediaBrowserCompat.MediaItem(
                    song.toMediaDescription(),
                    MediaBrowserCompat.MediaItem.FLAG_PLAYABLE
                )
            }.toMutableList()
            
            result.sendResult(musicItems)
        }.start()
    }
    
    inner class MediaSessionCallback : MediaSessionCompat.Callback() {
        
        override fun onPlayFromMediaId(mediaId: String, extras: Bundle?) {
            val song = MusicRepository.getSongById(mediaId)
            song?.let { playSong(it) }
        }
        
        override fun onPlay() {
            if (audioFocusManager.requestFocus()) {
                mediaPlayer.start()
                updatePlaybackState(PlaybackStateCompat.STATE_PLAYING)
            }
        }
        
        override fun onPause() {
            mediaPlayer.pause()
            updatePlaybackState(PlaybackStateCompat.STATE_PAUSED)
        }
        
        override fun onStop() {
            mediaPlayer.stop()
            audioFocusManager.abandonFocus()
            updatePlaybackState(PlaybackStateCompat.STATE_STOPPED)
        }
        
        override fun onSkipToNext() {
            playNextSong()
        }
        
        override fun onSkipToPrevious() {
            playPreviousSong()
        }
        
        override fun onSeekTo(pos: Long) {
            mediaPlayer.seekTo(pos.toInt())
            updatePlaybackState(
                if (mediaPlayer.isPlaying) PlaybackStateCompat.STATE_PLAYING 
                else PlaybackStateCompat.STATE_PAUSED
            )
        }
    }
    
    private fun playSong(song: Song) {
        try {
            mediaPlayer.reset()
            mediaPlayer.setDataSource(song.uri)
            mediaPlayer.prepareAsync()
            
            // 更新媒体元数据
            val metadata = MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_MEDIA_ID, song.id)
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, song.title)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, song.artist)
                .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, song.album)
                .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, song.duration)
                .build()
                
            mediaSession.setMetadata(metadata)
            
        } catch (e: IOException) {
            Log.e("MediaService", "Failed to play song", e)
            updatePlaybackState(PlaybackStateCompat.STATE_ERROR)
        }
    }
    
    private fun updatePlaybackState(state: Int) {
        val playbackState = PlaybackStateCompat.Builder()
            .setActions(getAvailableActions())
            .setState(state, mediaPlayer.currentPosition.toLong(), 1.0f)
            .build()
            
        mediaSession.setPlaybackState(playbackState)
    }
    
    private fun getAvailableActions(): Long {
        return PlaybackStateCompat.ACTION_PLAY or
               PlaybackStateCompat.ACTION_PAUSE or
               PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
               PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
               PlaybackStateCompat.ACTION_SEEK_TO
    }
}
```

### 7.3 Screen界面实现

#### 7.3.1 主界面Screen

```kotlin
class MainScreen(
    carContext: CarContext,
    private val musicRepository: MusicRepository,
    private val musicPlayer: MusicPlayer
) : Screen(carContext) {
    
    override fun onGetTemplate(): Template {
        return ListTemplate.Builder()
            .setSingleList(createMainMenuList())
            .setTitle("车载音乐")
            .setHeaderAction(Action.APP_ICON)
            .setActionStrip(createMainActionStrip())
            .build()
    }
    
    private fun createMainMenuList(): ItemList {
        return ItemList.Builder()
            .addItem(createMenuItem(
                "我的音乐", 
                "浏览本地音乐库",
                R.drawable.ic_library_music
            ) {
                screenManager.push(MusicLibraryScreen(carContext, musicRepository))
            })
            .addItem(createMenuItem(
                "播放列表",
                "查看播放列表", 
                R.drawable.ic_playlist_play
            ) {
                screenManager.push(PlaylistScreen(carContext, musicRepository))
            })
            .addItem(createMenuItem(
                "正在播放",
                getCurrentPlayingInfo(),
                R.drawable.ic_music_note
            ) {
                if (musicPlayer.isPlaying()) {
                    screenManager.push(PlayerScreen(carContext, musicPlayer))
                } else {
                    showToast("当前没有正在播放的音乐")
                }
            })
            .addItem(createMenuItem(
                "搜索音乐",
                "语音搜索或浏览",
                R.drawable.ic_search
            ) {
                screenManager.push(SearchScreen(carContext, musicRepository))
            })
            .build()
    }
    
    private fun createMenuItem(
        title: String, 
        subtitle: String, 
        iconRes: Int, 
        onClick: () -> Unit
    ): Item {
        return Item.Builder()
            .setTitle(title)
            .addText(subtitle)
            .setImage(CarIcon.of(IconCompat.createWithResource(carContext, iconRes)))
            .setOnClickListener(onClick)
            .build()
    }
    
    private fun createMainActionStrip(): ActionStrip {
        return ActionStrip.Builder()
            .addAction(
                Action.Builder()
                    .setTitle("语音搜索")
                    .setIcon(CarIcon.of(IconCompat.createWithResource(
                        carContext, R.drawable.ic_mic)))
                    .setOnClickListener { startVoiceSearch() }
                    .build()
            )
            .addAction(
                Action.Builder()
                    .setTitle("设置")
                    .setIcon(CarIcon.of(IconCompat.createWithResource(
                        carContext, R.drawable.ic_settings)))
                    .setOnClickListener { openSettings() }
                    .build()
            )
            .build()
    }
    
    private fun getCurrentPlayingInfo(): String {
        return if (musicPlayer.isPlaying()) {
            val currentSong = musicPlayer.getCurrentSong()
            "${currentSong.artist} - ${currentSong.title}"
        } else {
            "点击查看播放器"
        }
    }
    
    private fun startVoiceSearch() {
        // 启动语音搜索
        val searchIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, 
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PROMPT, "说出您想听的歌曲或艺术家")
        }
        
        try {
            carContext.startCarApp(searchIntent)
        } catch (e: ActivityNotFoundException) {
            showToast("语音搜索不可用")
        }
    }
    
    private fun showToast(message: String) {
        CarToast.makeText(carContext, message, CarToast.LENGTH_SHORT).show()
    }
}
```

#### 7.3.2 播放器Screen

```kotlin
class PlayerScreen(
    carContext: CarContext,
    private val musicPlayer: MusicPlayer
) : Screen(carContext) {
    
    private var currentSong: Song? = null
    private var isPlaying = false
    private var currentPosition = 0L
    private var duration = 0L
    
    override fun onCreate(owner: LifecycleOwner) {
        super.onCreate(owner)
        
        // 监听播放状态变化
        musicPlayer.setOnPlaybackStateChangeListener { state ->
            isPlaying = state.isPlaying
            currentPosition = state.position
            duration = state.duration
            currentSong = state.currentSong
            invalidate() // 刷新界面
        }
    }
    
    override fun onGetTemplate(): Template {
        return PaneTemplate.Builder(createPlayerPane())
            .setHeaderAction(Action.BACK)
            .setActionStrip(createPlayerActionStrip())
            .build()
    }
    
    private fun createPlayerPane(): Pane {
        val builder = Pane.Builder()
        
        currentSong?.let { song ->
            // 歌曲信息行
            builder.addRow(
                Row.Builder()
                    .setTitle(song.title)
                    .addText(song.artist)
                    .addText(song.album)
                    .setImage(createAlbumArt(song))
                    .build()
            )
            
            // 进度条行
            builder.addRow(createProgressRow())
            
            // 控制按钮行
            builder.addRow(createControlsRow())
            
        } ?: run {
            builder.addRow(
                Row.Builder()
                    .setTitle("没有正在播放的音乐")
                    .addText("请选择一首歌曲开始播放")
                    .build()
            )
        }
        
        return builder.build()
    }
    
    private fun createProgressRow(): Row {
        val progressText = "${formatTime(currentPosition)} / ${formatTime(duration)}"
        
        return Row.Builder()
            .setTitle("播放进度")
            .addText(progressText)
            // 在车载环境中，进度条通常用文本显示
            .build()
    }
    
    private fun createControlsRow(): Row {
        return Row.Builder()
            .setTitle("播放控制")
            .addText(if (isPlaying) "正在播放" else "已暂停")
            .setImage(createPlayPauseIcon())
            .setOnClickListener { togglePlayPause() }
            .build()
    }
    
    private fun createPlayerActionStrip(): ActionStrip {
        return ActionStrip.Builder()
            .addAction(
                Action.Builder()
                    .setIcon(CarIcon.of(IconCompat.createWithResource(
                        carContext, R.drawable.ic_skip_previous)))
                    .setOnClickListener { musicPlayer.playPrevious() }
                    .build()
            )
            .addAction(
                Action.Builder()
                    .setIcon(createPlayPauseIcon())
                    .setOnClickListener { togglePlayPause() }
                    .build()
            )
            .addAction(
                Action.Builder()
                    .setIcon(CarIcon.of(IconCompat.createWithResource(
                        carContext, R.drawable.ic_skip_next)))
                    .setOnClickListener { musicPlayer.playNext() }
                    .build()
            )
            .addAction(
                Action.Builder()
                    .setTitle("播放模式")
                    .setIcon(createRepeatModeIcon())
                    .setOnClickListener { toggleRepeatMode() }
                    .build()
            )
            .build()
    }
    
    private fun createPlayPauseIcon(): CarIcon {
        val iconRes = if (isPlaying) R.drawable.ic_pause else R.drawable.ic_play_arrow
        return CarIcon.of(IconCompat.createWithResource(carContext, iconRes))
    }
    
    private fun createRepeatModeIcon(): CarIcon {
        val iconRes = when (musicPlayer.getRepeatMode()) {
            RepeatMode.NONE -> R.drawable.ic_repeat
            RepeatMode.ONE -> R.drawable.ic_repeat_one
            RepeatMode.ALL -> R.drawable.ic_repeat_all
        }
        return CarIcon.of(IconCompat.createWithResource(carContext, iconRes))
    }
    
    private fun createAlbumArt(song: Song): CarIcon {
        // 加载专辑封面，如果没有则使用默认图标
        return song.albumArtUri?.let { uri ->
            CarIcon.of(IconCompat.createWithContentUri(uri))
        } ?: CarIcon.of(IconCompat.createWithResource(carContext, R.drawable.default_album_art))
    }
    
    private fun togglePlayPause() {
        if (isPlaying) {
            musicPlayer.pause()
        } else {
            musicPlayer.play()
        }
    }
    
    private fun toggleRepeatMode() {
        musicPlayer.toggleRepeatMode()
    }
    
    private fun formatTime(timeMs: Long): String {
        val seconds = (timeMs / 1000) % 60
        val minutes = (timeMs / 1000) / 60
        return String.format("%d:%02d", minutes, seconds)
    }
}
```

### 7.4 数据层实现

#### 7.4.1 音乐数据模型

```kotlin
data class Song(
    val id: String,
    val title: String,
    val artist: String,
    val album: String,
    val duration: Long, // 毫秒
    val uri: String,
    val albumArtUri: String? = null,
    val genre: String? = null,
    val year: Int? = null
) {
    fun toMediaDescription(): MediaDescriptionCompat {
        return MediaDescriptionCompat.Builder()
            .setMediaId(id)
            .setTitle(title)
            .setSubtitle(artist)
            .setDescription(album)
            .setIconUri(albumArtUri?.let { Uri.parse(it) })
            .setMediaUri(Uri.parse(uri))
            .build()
    }
}

data class Playlist(
    val id: String,
    val name: String,
    val songs: List<Song>,
    val createdAt: Long = System.currentTimeMillis()
)

data class PlaybackState(
    val isPlaying: Boolean,
    val position: Long,
    val duration: Long,
    val currentSong: Song?
)

enum class RepeatMode {
    NONE, ONE, ALL
}
```

#### 7.4.2 音乐仓库

```kotlin
class MusicRepository(private val context: Context) {
    companion object {
        private const val MUSIC_PREFS = "music_preferences"
    }
    
    private val contentResolver = context.contentResolver
    private val preferences = context.getSharedPreferences(MUSIC_PREFS, Context.MODE_PRIVATE)
    
    fun getAllMusic(): List<Song> {
        val songs = mutableListOf<Song>()
        
        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.DATA,
            MediaStore.Audio.Media.ALBUM_ID
        )
        
        val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0"
        val sortOrder = "${MediaStore.Audio.Media.TITLE} ASC"
        
        contentResolver.query(
            MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
            projection,
            selection,
            null,
            sortOrder
        )?.use { cursor ->
            
            val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
            val titleColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
            val artistColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
            val albumColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
            val durationColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
            val dataColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
            val albumIdColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
            
            while (cursor.moveToNext()) {
                val id = cursor.getLong(idColumn).toString()
                val title = cursor.getString(titleColumn) ?: "Unknown"
                val artist = cursor.getString(artistColumn) ?: "Unknown Artist"
                val album = cursor.getString(albumColumn) ?: "Unknown Album"
                val duration = cursor.getLong(durationColumn)
                val data = cursor.getString(dataColumn)
                val albumId = cursor.getLong(albumIdColumn)
                
                val albumArtUri = getAlbumArtUri(albumId)
                
                songs.add(
                    Song(
                        id = id,
                        title = title,
                        artist = artist,
                        album = album,
                        duration = duration,
                        uri = data,
                        albumArtUri = albumArtUri
                    )
                )
            }
        }
        
        return songs
    }
    
    private fun getAlbumArtUri(albumId: Long): String? {
        return try {
            val uri = ContentUris.withAppendedId(
                Uri.parse("content://media/external/audio/albumart"),
                albumId
            )
            uri.toString()
        } catch (e: Exception) {
            null
        }
    }
    
    fun getSongById(id: String): Song? {
        return getAllMusic().find { it.id == id }
    }
    
    fun searchSongs(query: String): List<Song> {
        return getAllMusic().filter { song ->
            song.title.contains(query, ignoreCase = true) ||
            song.artist.contains(query, ignoreCase = true) ||
            song.album.contains(query, ignoreCase = true)
        }