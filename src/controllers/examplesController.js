/**
 * 在线代码示例控制器
 */

// 代码示例数据
const codeExamples = [
  {
    id: 'android-automotive-hello',
    title: 'Android Automotive Hello World',
    category: 'android-automotive',
    difficulty: 'beginner',
    language: 'kotlin',
    description: '基础的Android Automotive应用开发示例，展示如何创建车载应用',
    tags: ['Android Automotive', 'Kotlin', '基础入门'],
    code: `package com.zhiyun.automotive.hello

import android.app.Activity
import android.car.Car
import android.car.hardware.CarPropertyManager
import android.os.Bundle
import android.widget.TextView
import androidx.car.app.CarAppExtender

/**
 * Android Automotive Hello World 示例
 * 展示基本的车载应用结构和Car API使用
 */
class MainActivity : Activity() {
    
    private lateinit var car: Car
    private lateinit var carPropertyManager: CarPropertyManager
    private lateinit var statusText: TextView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        statusText = findViewById(R.id.status_text)
        statusText.text = "正在连接车辆系统..."
        
        // 连接到车辆服务
        connectToCarService()
    }
    
    private fun connectToCarService() {
        car = Car.createCar(this) { car, ready ->
            if (ready) {
                onCarServiceReady(car)
            } else {
                statusText.text = "无法连接到车辆系统"
            }
        }
    }
    
    private fun onCarServiceReady(car: Car) {
        statusText.text = "车辆系统连接成功！"
        
        // 获取车辆属性管理器
        carPropertyManager = car.getCarManager(Car.PROPERTY_SERVICE) as CarPropertyManager
        
        // 读取车辆速度
        try {
            val speed = carPropertyManager.getFloatProperty(
                CarPropertyManager.VEHICLE_SPEED, 
                0
            )
            statusText.text = "当前车速: \${speed}km/h"
        } catch (e: Exception) {
            statusText.text = "读取车速失败: \${e.message}"
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        if (::car.isInitialized) {
            car.disconnect()
        }
    }
}`,
    explanation: `这是一个基础的Android Automotive应用示例，展示了：

1. **Car服务连接**: 使用Car.createCar()连接到车载系统
2. **属性管理器**: 通过CarPropertyManager读取车辆状态
3. **生命周期管理**: 正确的连接和断开车载服务
4. **错误处理**: 处理连接失败和属性读取异常

关键概念：
- Car API是Android Automotive的核心接口
- CarPropertyManager用于访问车辆属性（如速度、燃油等）
- 车载应用需要处理车辆服务的异步连接`,
    dependencies: ['androidx.car:car:1.0.0-alpha7', 'androidx.car.app:app:1.2.0'],
  },
  {
    id: 'can-bus-communication',
    title: 'CAN总线通信示例',
    category: 'can-bus',
    difficulty: 'intermediate',
    language: 'c',
    description: 'C语言实现的CAN总线通信示例，展示如何发送和接收CAN消息',
    tags: ['CAN总线', 'C语言', '底层通信'],
    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <linux/can.h>
#include <linux/can/raw.h>
#include <net/if.h>

/**
 * CAN总线通信示例
 * 演示如何使用SocketCAN在Linux系统中进行CAN通信
 */

#define CAN_INTERFACE "can0"
#define ENGINE_RPM_ID    0x201
#define VEHICLE_SPEED_ID 0x202
#define FUEL_LEVEL_ID    0x203

typedef struct {
    int socket_fd;
    struct sockaddr_can addr;
} can_handler_t;

// 初始化CAN接口
int init_can_interface(can_handler_t* handler) {
    struct ifreq ifr;
    
    // 创建socket
    handler->socket_fd = socket(PF_CAN, SOCK_RAW, CAN_RAW);
    if (handler->socket_fd < 0) {
        perror("创建CAN socket失败");
        return -1;
    }
    
    // 配置接口
    strcpy(ifr.ifr_name, CAN_INTERFACE);
    ioctl(handler->socket_fd, SIOCGIFINDEX, &ifr);
    
    handler->addr.can_family = AF_CAN;
    handler->addr.can_ifindex = ifr.ifr_ifindex;
    
    // 绑定socket
    if (bind(handler->socket_fd, 
             (struct sockaddr*)&handler->addr, 
             sizeof(handler->addr)) < 0) {
        perror("绑定CAN socket失败");
        close(handler->socket_fd);
        return -1;
    }
    
    printf("CAN接口 %s 初始化成功\\n", CAN_INTERFACE);
    return 0;
}

// 发送CAN消息
int send_can_message(can_handler_t* handler, 
                     uint32_t id, 
                     uint8_t* data, 
                     uint8_t length) {
    struct can_frame frame;
    
    frame.can_id = id;
    frame.can_dlc = length;
    memcpy(frame.data, data, length);
    
    ssize_t bytes_sent = write(handler->socket_fd, &frame, sizeof(frame));
    if (bytes_sent != sizeof(frame)) {
        perror("发送CAN消息失败");
        return -1;
    }
    
    printf("发送CAN消息: ID=0x%X, DLC=%d\\n", id, length);
    return 0;
}

// 接收CAN消息
int receive_can_message(can_handler_t* handler, struct can_frame* frame) {
    ssize_t bytes_received = read(handler->socket_fd, frame, sizeof(*frame));
    if (bytes_received != sizeof(*frame)) {
        perror("接收CAN消息失败");
        return -1;
    }
    
    printf("接收CAN消息: ID=0x%X, DLC=%d\\n", 
           frame->can_id, frame->can_dlc);
    return 0;
}

// 解析发动机转速消息
void parse_engine_rpm(struct can_frame* frame) {
    if (frame->can_id == ENGINE_RPM_ID && frame->can_dlc >= 2) {
        uint16_t rpm = (frame->data[0] << 8) | frame->data[1];
        printf("发动机转速: %d RPM\\n", rpm);
    }
}

// 发送车速消息
void send_vehicle_speed(can_handler_t* handler, uint16_t speed_kmh) {
    uint8_t data[2];
    data[0] = (speed_kmh >> 8) & 0xFF;  // 高字节
    data[1] = speed_kmh & 0xFF;         // 低字节
    
    send_can_message(handler, VEHICLE_SPEED_ID, data, 2);
}

// 主函数演示
int main() {
    can_handler_t can_handler;
    struct can_frame frame;
    
    // 初始化CAN接口
    if (init_can_interface(&can_handler) < 0) {
        return -1;
    }
    
    // 模拟发送车速数据
    printf("发送车速数据...\\n");
    send_vehicle_speed(&can_handler, 60);  // 60 km/h
    
    // 接收和处理CAN消息
    printf("等待接收CAN消息...\\n");
    while (1) {
        if (receive_can_message(&can_handler, &frame) == 0) {
            // 根据消息ID处理不同类型的数据
            switch (frame.can_id) {
                case ENGINE_RPM_ID:
                    parse_engine_rpm(&frame);
                    break;
                case VEHICLE_SPEED_ID:
                    printf("收到车速数据\\n");
                    break;
                default:
                    printf("未知CAN消息ID: 0x%X\\n", frame.can_id);
                    break;
            }
        }
        
        usleep(100000);  // 100ms延迟
    }
    
    close(can_handler.socket_fd);
    return 0;
}`,
    explanation: `这个示例展示了在Linux系统中使用SocketCAN进行CAN总线通信：

1. **SocketCAN**: Linux内核提供的CAN总线接口
2. **消息格式**: CAN帧包含ID、数据长度和数据内容
3. **发送接收**: 使用标准的socket读写操作
4. **数据解析**: 根据CAN ID解析不同类型的车辆数据

实际应用中的考虑：
- 错误处理和重连机制
- 消息过滤和优先级处理
- 实时性要求和缓冲区管理
- 网络拓扑和节点管理

编译命令：
gcc -o can_example can_example.c`,
    dependencies: ['linux-headers (for CAN support)', 'can-utils (for testing)'],
  },
  {
    id: 'qnx-realtime-task',
    title: 'QNX实时任务调度',
    category: 'qnx',
    difficulty: 'advanced',
    language: 'cpp',
    description: 'QNX Neutrino实时操作系统中的任务调度和IPC通信示例',
    tags: ['QNX', 'C++', '实时系统', 'IPC'],
    code: `#include <iostream>
#include <sys/neutrino.h>
#include <sys/dispatch.h>
#include <pthread.h>
#include <sched.h>
#include <unistd.h>
#include <errno.h>

/**
 * QNX Neutrino实时任务调度示例
 * 展示实时任务创建、优先级设置和消息传递
 */

#define PULSE_CODE_TIMER    1
#define PULSE_CODE_DATA     2
#define HIGH_PRIORITY       60
#define NORMAL_PRIORITY     10

// 消息结构体
struct vehicle_data_msg {
    struct _pulse pulse;
    int speed;
    int rpm;
    float fuel_level;
};

class RealtimeTaskManager {
private:
    pthread_t high_priority_thread;
    pthread_t normal_priority_thread;
    int channel_id;
    int connection_id;
    
public:
    RealtimeTaskManager() : channel_id(-1), connection_id(-1) {}
    
    // 初始化消息通道
    int initialize() {
        // 创建消息通道
        channel_id = ChannelCreate(0);
        if (channel_id == -1) {
            std::cerr << "创建消息通道失败: " << strerror(errno) << std::endl;
            return -1;
        }
        
        // 连接到通道
        connection_id = ConnectAttach(ND_LOCAL_NODE, 0, channel_id, 
                                     _NTO_SIDE_CHANNEL, 0);
        if (connection_id == -1) {
            std::cerr << "连接消息通道失败: " << strerror(errno) << std::endl;
            ChannelDestroy(channel_id);
            return -1;
        }
        
        std::cout << "消息通道初始化成功" << std::endl;
        return 0;
    }
    
    // 创建高优先级实时任务
    int create_high_priority_task() {
        pthread_attr_t attr;
        struct sched_param param;
        
        pthread_attr_init(&attr);
        pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_JOINABLE);
        pthread_attr_setinheritsched(&attr, PTHREAD_EXPLICIT_SCHED);
        pthread_attr_setschedpolicy(&attr, SCHED_FIFO);
        
        param.sched_priority = HIGH_PRIORITY;
        pthread_attr_setschedparam(&attr, &param);
        
        int result = pthread_create(&high_priority_thread, &attr,
                                   high_priority_worker, this);
        pthread_attr_destroy(&attr);
        
        if (result != 0) {
            std::cerr << "创建高优先级线程失败: " << strerror(result) << std::endl;
            return -1;
        }
        
        std::cout << "高优先级实时任务创建成功 (优先级: " << HIGH_PRIORITY << ")" << std::endl;
        return 0;
    }
    
    // 创建普通优先级任务
    int create_normal_priority_task() {
        pthread_attr_t attr;
        struct sched_param param;
        
        pthread_attr_init(&attr);
        pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_JOINABLE);
        pthread_attr_setinheritsched(&attr, PTHREAD_EXPLICIT_SCHED);
        pthread_attr_setschedpolicy(&attr, SCHED_RR);
        
        param.sched_priority = NORMAL_PRIORITY;
        pthread_attr_setschedparam(&attr, &param);
        
        int result = pthread_create(&normal_priority_thread, &attr,
                                   normal_priority_worker, this);
        pthread_attr_destroy(&attr);
        
        if (result != 0) {
            std::cerr << "创建普通优先级线程失败: " << strerror(result) << std::endl;
            return -1;
        }
        
        std::cout << "普通优先级任务创建成功 (优先级: " << NORMAL_PRIORITY << ")" << std::endl;
        return 0;
    }
    
    // 发送脉冲消息
    int send_pulse(int code, int value) {
        struct _pulse pulse;
        pulse.type = _PULSE_TYPE;
        pulse.subtype = _PULSE_SUBTYPE;
        pulse.code = code;
        pulse.value.sival_int = value;
        
        return MsgSendPulse(connection_id, getprio(0), code, value);
    }
    
    // 高优先级工作线程（实时任务）
    static void* high_priority_worker(void* arg) {
        RealtimeTaskManager* manager = static_cast<RealtimeTaskManager*>(arg);
        struct _pulse pulse;
        int rcvid;
        
        std::cout << "高优先级实时任务开始运行..." << std::endl;
        
        while (true) {
            // 接收消息或脉冲
            rcvid = MsgReceivePulse(manager->channel_id, &pulse, 
                                   sizeof(pulse), NULL);
            
            if (rcvid == 0) {  // 脉冲消息
                switch (pulse.code) {
                    case PULSE_CODE_TIMER:
                        // 处理定时器脉冲（高实时性要求）
                        manager->process_critical_timing();
                        break;
                    case PULSE_CODE_DATA:
                        // 处理关键数据（安全相关）
                        manager->process_safety_critical_data(pulse.value.sival_int);
                        break;
                    default:
                        std::cout << "未知脉冲代码: " << pulse.code << std::endl;
                        break;
                }
            }
            
            // 实时任务应该避免长时间阻塞
            usleep(1000);  // 1ms
        }
        
        return nullptr;
    }
    
    // 普通优先级工作线程
    static void* normal_priority_worker(void* arg) {
        RealtimeTaskManager* manager = static_cast<RealtimeTaskManager*>(arg);
        int count = 0;
        
        std::cout << "普通优先级任务开始运行..." << std::endl;
        
        while (true) {
            // 模拟数据处理工作
            manager->process_background_tasks();
            
            // 定期发送数据脉冲
            if (++count % 100 == 0) {
                manager->send_pulse(PULSE_CODE_DATA, count);
            }
            
            usleep(10000);  // 10ms
        }
        
        return nullptr;
    }
    
    // 处理关键时序任务
    void process_critical_timing() {
        // 这里处理对时序要求严格的任务
        // 例如：CAN消息发送、传感器数据采集等
        static int timer_count = 0;
        timer_count++;
        
        if (timer_count % 1000 == 0) {
            std::cout << "定时器脉冲处理: " << timer_count << std::endl;
        }
    }
    
    // 处理安全关键数据
    void process_safety_critical_data(int data) {
        // 处理安全相关的数据，如ADAS系统数据
        std::cout << "处理安全关键数据: " << data << std::endl;
        
        // 模拟数据验证和处理
        if (data > 1000) {
            std::cout << "警告：检测到异常数据值" << std::endl;
        }
    }
    
    // 处理后台任务
    void process_background_tasks() {
        // 处理非实时性任务，如日志记录、统计等
        static int bg_count = 0;
        bg_count++;
        
        if (bg_count % 500 == 0) {
            std::cout << "后台任务处理: " << bg_count << std::endl;
        }
    }
    
    // 清理资源
    void cleanup() {
        if (connection_id != -1) {
            ConnectDetach(connection_id);
        }
        if (channel_id != -1) {
            ChannelDestroy(channel_id);
        }
    }
    
    ~RealtimeTaskManager() {
        cleanup();
    }
};

// 主函数演示
int main() {
    RealtimeTaskManager task_manager;
    
    // 初始化系统
    if (task_manager.initialize() != 0) {
        return -1;
    }
    
    // 创建实时任务
    if (task_manager.create_high_priority_task() != 0) {
        return -1;
    }
    
    if (task_manager.create_normal_priority_task() != 0) {
        return -1;
    }
    
    std::cout << "系统初始化完成，开始运行..." << std::endl;
    
    // 主循环发送定时脉冲
    for (int i = 0; i < 10000; ++i) {
        task_manager.send_pulse(PULSE_CODE_TIMER, i);
        usleep(5000);  // 5ms间隔
    }
    
    std::cout << "示例程序结束" << std::endl;
    return 0;
}`,
    explanation: `这个QNX示例展示了实时系统开发的关键概念：

1. **实时调度**: 使用SCHED_FIFO和SCHED_RR策略
2. **优先级管理**: 高优先级任务处理关键任务
3. **消息传递**: QNX的消息和脉冲机制
4. **资源管理**: 正确的初始化和清理

QNX特性：
- 微内核架构提供高可靠性
- 确定性调度保证实时响应
- 消息传递机制支持分布式系统
- POSIX兼容性便于移植

编译命令：
qcc -V gcc_ntoarmv7le -o realtime_example realtime_example.cpp -lpthread`,
    dependencies: ['QNX Neutrino RTOS', 'QNX Momentics IDE'],
  },
];

// 分类数据
const categories = [
  {
    id: 'android-automotive',
    name: 'Android Automotive',
    description: 'Android车载系统开发示例',
    icon: 'fab fa-android',
    color: '#a4c639',
    count: 1,
  },
  {
    id: 'can-bus',
    name: 'CAN总线通信',
    description: 'CAN总线协议和通信示例',
    icon: 'fas fa-network-wired',
    color: '#ff6b6b',
    count: 1,
  },
  {
    id: 'qnx',
    name: 'QNX实时系统',
    description: 'QNX Neutrino实时操作系统开发',
    icon: 'fas fa-microchip',
    color: '#4ecdc4',
    count: 1,
  },
  {
    id: 'linux-embedded',
    name: 'Linux嵌入式',
    description: 'Linux嵌入式系统开发',
    icon: 'fab fa-linux',
    color: '#45b7d1',
    count: 0,
  },
];

// 代码示例主页
exports.index = (req, res) => {
  const pageData = {
    title: '在线代码示例',
    description: '车载应用开发代码示例和在线演示平台',
    examples: codeExamples,
    categories: categories,
    featuredExamples: codeExamples.filter((example) =>
      ['android-automotive-hello', 'can-bus-communication'].includes(example.id)
    ),
    stats: {
      totalExamples: codeExamples.length,
      categories: categories.length,
      languages: [...new Set(codeExamples.map((e) => e.language))].length,
      difficulty: {
        beginner: codeExamples.filter((e) => e.difficulty === 'beginner').length,
        intermediate: codeExamples.filter((e) => e.difficulty === 'intermediate').length,
        advanced: codeExamples.filter((e) => e.difficulty === 'advanced').length,
      },
    },
  };

  res.render('examples/index', { pageData });
};

// 示例分类页面
exports.category = (req, res) => {
  const categoryId = req.params.category;
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return res.status(404).render('404');
  }

  const categoryExamples = codeExamples.filter((e) => e.category === categoryId);

  const pageData = {
    title: `${category.name} - 代码示例`,
    description: category.description,
    category: category,
    examples: categoryExamples,
    categories: categories,
  };

  res.render('examples/category', { pageData });
};

// 具体示例演示页面
exports.demo = (req, res) => {
  const exampleId = req.params.id;
  const example = codeExamples.find((e) => e.id === exampleId);

  if (!example) {
    return res.status(404).render('404');
  }

  // 获取相关示例
  const relatedExamples = codeExamples
    .filter((e) => e.id !== exampleId && e.category === example.category)
    .slice(0, 3);

  const pageData = {
    title: `${example.title} - 代码示例`,
    description: example.description,
    example: example,
    relatedExamples: relatedExamples,
    category: categories.find((c) => c.id === example.category),
  };

  res.render('examples/demo', { pageData });
};

// 在线运行代码（模拟功能）
exports.runCode = async (req, res) => {
  try {
    const { code, language, exampleId } = req.body;

    // 模拟代码执行（实际应该使用安全的代码执行环境）
    const mockResult = {
      success: true,
      output: generateMockOutput(language, exampleId),
      executionTime: Math.random() * 1000 + 500, // 500-1500ms
      memoryUsage: Math.floor(Math.random() * 50) + 10, // 10-60MB
    };

    res.json(mockResult);
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: '代码执行失败',
      message: error.message,
    });
  }
};

// 获取示例统计
exports.getStats = (req, res) => {
  try {
    const stats = {
      overview: {
        totalExamples: codeExamples.length,
        categories: categories.length,
        languages: [...new Set(codeExamples.map((e) => e.language))].length,
      },
      byCategory: categories.map((category) => ({
        id: category.id,
        name: category.name,
        count: codeExamples.filter((e) => e.category === category.id).length,
      })),
      byDifficulty: {
        beginner: codeExamples.filter((e) => e.difficulty === 'beginner').length,
        intermediate: codeExamples.filter((e) => e.difficulty === 'intermediate').length,
        advanced: codeExamples.filter((e) => e.difficulty === 'advanced').length,
      },
      byLanguage: [...new Set(codeExamples.map((e) => e.language))].map((lang) => ({
        language: lang,
        count: codeExamples.filter((e) => e.language === lang).length,
      })),
      popularExamples: codeExamples.slice(0, 5).map((example) => ({
        id: example.id,
        title: example.title,
        category: example.category,
        difficulty: example.difficulty,
      })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Examples stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
    });
  }
};

// 生成模拟输出
function generateMockOutput(language, exampleId) {
  const outputs = {
    kotlin: {
      'android-automotive-hello': `编译成功!
正在启动应用...
车辆系统连接成功！
当前车速: 45.5km/h
应用运行正常`,
    },
    c: {
      'can-bus-communication': `CAN接口 can0 初始化成功
发送CAN消息: ID=0x202, DLC=2
等待接收CAN消息...
接收CAN消息: ID=0x201, DLC=2
发动机转速: 2500 RPM
收到车速数据`,
    },
    cpp: {
      'qnx-realtime-task': `消息通道初始化成功
高优先级实时任务创建成功 (优先级: 60)
普通优先级任务创建成功 (优先级: 10)
系统初始化完成，开始运行...
高优先级实时任务开始运行...
普通优先级任务开始运行...
定时器脉冲处理: 1000
处理安全关键数据: 100
后台任务处理: 500`,
    },
  };

  return (
    outputs[language]?.[exampleId] ||
    `代码执行成功!
输出结果:
Hello World from ${language}!
执行完成.`
  );
}
