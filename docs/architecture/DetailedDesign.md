# 车载应用开发服务公司门户网站详细设计文档

## 1. 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 车载应用开发服务公司门户网站详细设计文档 |
| 文档版本 | v1.0 |
| 创建日期 | 2025-01-28 |
| 最后更新 | 2025-01-28 |
| 作者 | 系统架构师、高级工程师团队 |
| 审核人 | 技术总监、产品总监 |
| 批准人 | CTO |
| 文档状态 | 正式发布 |

### 1.1 版本历史

| 版本 | 日期 | 修改内容 | 修改人 | 审核人 |
|------|------|---------|--------|--------|
| v1.0 | 2025-01-28 | 初始版本创建 | 架构团队 | 技术总监 |

### 1.2 文档范围

本文档详细描述车载应用开发服务公司门户网站的技术实现方案，包括：
- 系统架构设计
- 模块详细设计
- 数据库设计
- API接口设计
- 安全设计
- 性能设计
- 部署方案
- 测试策略

### 1.3 目标读者

- 开发工程师
- 系统架构师
- 测试工程师
- 运维工程师
- 产品经理
- 项目经理

## 2. 系统概述

### 2.1 项目背景

本项目旨在构建一个专业的车载应用开发服务门户网站，为汽车行业客户提供全方位的应用开发服务展示、项目协作和客户管理功能。系统需要满足车载行业的专业性要求，支持高并发访问和复杂的业务流程管理。

### 2.2 业务目标

- **服务展示**：全面展示车载应用开发服务能力和成功案例
- **客户管理**：提供完整的客户关系管理和项目协作功能
- **效率提升**：通过AI辅助工具提升开发效率和服务质量
- **行业合规**：符合车载行业安全标准和质量要求

### 2.3 技术目标

- **高可用性**：系统可用性达到99.9%以上
- **高性能**：页面响应时间<2秒，API响应时间<500ms
- **高并发**：支持1万+并发用户访问
- **安全性**：符合ISO 27001信息安全标准
- **可扩展性**：支持水平扩展和微服务架构

### 2.4 技术约束

- **技术栈**：React + Node.js + PostgreSQL + Redis + Kubernetes
- **部署环境**：云原生容器化部署
- **安全要求**：SSL/TLS加密，OAuth2.0认证
- **性能要求**：支持CDN加速，数据库读写分离
- **合规要求**：符合GDPR、等保三级要求

## 3. 系统架构设计

### 3.1 总体架构

```plantuml
@startuml
skinparam packageStyle rectangle

package "用户层" {
  actor "企业客户" as client
  actor "项目经理" as pm
  actor "开发团队" as dev_team
  actor "系统管理员" as admin
}

package "展示层 (Presentation Layer)" {
  rectangle "Web前端应用" as web_app {
    rectangle "服务展示模块" as service_display
    rectangle "客户协作模块" as client_collab
    rectangle "项目管理模块" as project_mgmt
    rectangle "管理后台模块" as admin_panel
  }
}

package "API网关层 (API Gateway Layer)" {
  rectangle "API网关" as api_gateway {
    rectangle "路由管理" as routing
    rectangle "负载均衡" as load_balancer
    rectangle "限流熔断" as rate_limiter
    rectangle "认证授权" as auth
  }
}

package "业务逻辑层 (Business Logic Layer)" {
  rectangle "应用服务层" as app_service {
    rectangle "服务展示服务" as service_svc
    rectangle "客户管理服务" as client_svc
    rectangle "项目协作服务" as project_svc
    rectangle "用户管理服务" as user_svc
    rectangle "技术支持服务" as support_svc
  }
  
  rectangle "开发辅助层" as dev_tools {
    rectangle "代码生成服务" as code_gen
    rectangle "模板管理服务" as template_svc
    rectangle "AI辅助服务" as ai_assistant
  }
}

package "数据访问层 (Data Access Layer)" {
  rectangle "数据访问对象" as dao {
    rectangle "客户数据访问" as client_dao
    rectangle "项目数据访问" as project_dao
    rectangle "用户数据访问" as user_dao
    rectangle "内容数据访问" as content_dao
  }
}

package "数据存储层 (Data Storage Layer)" {
  database "主数据库" as main_db {
    rectangle "PostgreSQL集群" as postgres
  }
  
  database "缓存数据库" as cache_db {
    rectangle "Redis集群" as redis
  }
  
  database "搜索引擎" as search_db {
    rectangle "Elasticsearch" as es
  }
  
  rectangle "文件存储" as file_storage {
    rectangle "对象存储OSS" as oss
  }
}

package "基础设施层 (Infrastructure Layer)" {
  rectangle "容器编排" as k8s_cluster {
    rectangle "Kubernetes" as k8s
  }
  
  rectangle "监控告警" as monitoring {
    rectangle "Prometheus" as prom
    rectangle "Grafana" as grafana
    rectangle "ELK Stack" as elk
  }
  
  rectangle "CI/CD" as cicd {
    rectangle "GitLab CI" as gitlab
    rectangle "ArgoCD" as argocd
  }
}

' 连接关系
client --> web_app
pm --> web_app
dev_team --> web_app
admin --> web_app

web_app --> api_gateway
api_gateway --> app_service
api_gateway --> dev_tools

app_service --> dao
dev_tools --> dao

dao --> main_db
dao --> cache_db
dao --> search_db
dao --> file_storage

k8s_cluster --> app_service
k8s_cluster --> dev_tools
monitoring --> k8s_cluster
cicd --> k8s_cluster

@enduml
```

### 3.2 架构特点

#### 3.2.1 分层架构
采用经典的分层架构模式，各层职责清晰：
- **展示层**：负责用户界面和用户交互
- **API网关层**：统一接入点，处理横切关注点
- **业务逻辑层**：核心业务逻辑处理
- **数据访问层**：数据访问抽象和优化
- **数据存储层**：数据持久化和存储
- **基础设施层**：基础设施服务支撑

#### 3.2.2 微服务架构
- **服务自治**：每个微服务独立开发、部署、扩展
- **数据隔离**：每个服务拥有独立的数据存储
- **通信机制**：服务间通过REST API和消息队列通信
- **容错设计**：断路器、重试机制、降级策略

#### 3.2.3 云原生设计
- **容器化**：所有服务容器化部署
- **编排管理**：Kubernetes统一编排管理
- **弹性伸缩**：根据负载自动扩缩容
- **服务发现**：自动服务注册和发现

## 4. 微服务架构详细设计

### 4.1 微服务拆分策略

根据业务领域和功能边界，系统拆分为以下微服务：

```plantuml
@startuml
package "API Gateway" {
  rectangle "API网关服务" as APIGateway {
    rectangle "路由管理" as Routing
    rectangle "认证授权" as Auth
    rectangle "限流熔断" as RateLimit
    rectangle "负载均衡" as LoadBalance
  }
}

package "核心业务服务" {
  rectangle "用户服务" as UserService {
    rectangle "用户管理" as UserMgmt
    rectangle "角色权限" as RolePermission
    rectangle "认证授权" as UserAuth
  }
  
  rectangle "客户服务" as ClientService {
    rectangle "客户信息管理" as ClientInfo
    rectangle "客户关系管理" as CRM
    rectangle "客户分级管理" as ClientLevel
  }
  
  rectangle "项目服务" as ProjectService {
    rectangle "项目管理" as ProjectMgmt
    rectangle "里程碑管理" as MilestonesMgmt
    rectangle "项目统计" as ProjectStats
  }
  
  rectangle "任务服务" as TaskService {
    rectangle "任务管理" as TaskMgmt
    rectangle "任务分配" as TaskAssign
    rectangle "进度跟踪" as ProgressTrack
  }
  
  rectangle "协作服务" as CollaborationService {
    rectangle "实时消息" as RealtimeMsg
    rectangle "文档共享" as DocShare
    rectangle "在线会议" as VideoCall
  }
  
  rectangle "支持服务" as SupportService {
    rectangle "工单管理" as TicketMgmt
    rectangle "知识库" as Knowledge
    rectangle "FAQ管理" as FAQMgmt
  }
}

package "业务支撑服务" {
  rectangle "内容服务" as ContentService {
    rectangle "案例管理" as CaseMgmt
    rectangle "服务展示" as ServiceDisplay
    rectangle "技术文档" as TechDoc
  }
  
  rectangle "文件服务" as FileService {
    rectangle "文件上传" as FileUpload
    rectangle "文件存储" as FileStorage
    rectangle "文件预览" as FilePreview
  }
  
  rectangle "通知服务" as NotificationService {
    rectangle "邮件通知" as EmailNotify
    rectangle "短信通知" as SMSNotify
    rectangle "站内信" as InternalMsg
  }
  
  rectangle "搜索服务" as SearchService {
    rectangle "全文搜索" as FullTextSearch
    rectangle "智能推荐" as SmartRecommend
    rectangle "搜索分析" as SearchAnalytics
  }
}

package "AI辅助服务" {
  rectangle "AI服务" as AIService {
    rectangle "代码生成" as CodeGen
    rectangle "智能补全" as AutoComplete
    rectangle "代码审查" as CodeReview
    rectangle "性能优化建议" as PerfOptimize
  }
  
  rectangle "模板服务" as TemplateService {
    rectangle "模板管理" as TemplateMgmt
    rectangle "模板生成" as TemplateGen
    rectangle "模板版本控制" as TemplateVersion
  }
}

package "基础设施服务" {
  rectangle "配置服务" as ConfigService {
    rectangle "配置管理" as ConfigMgmt
    rectangle "配置下发" as ConfigDistribute
    rectangle "配置监控" as ConfigMonitor
  }
  
  rectangle "日志服务" as LogService {
    rectangle "日志收集" as LogCollect
    rectangle "日志分析" as LogAnalysis
    rectangle "日志告警" as LogAlert
  }
  
  rectangle "监控服务" as MonitorService {
    rectangle "指标收集" as MetricsCollect
    rectangle "健康检查" as HealthCheck
    rectangle "告警管理" as AlertMgmt
  }
}

' 服务依赖关系
APIGateway --> UserService
APIGateway --> ClientService
APIGateway --> ProjectService
APIGateway --> TaskService
APIGateway --> CollaborationService
APIGateway --> SupportService
APIGateway --> ContentService
APIGateway --> FileService
APIGateway --> AIService

ProjectService --> ClientService
ProjectService --> UserService
TaskService --> ProjectService
TaskService --> UserService
CollaborationService --> ProjectService
CollaborationService --> UserService
SupportService --> ClientService
SupportService --> UserService

NotificationService --> UserService
SearchService --> ContentService
SearchService --> ProjectService
AIService --> TemplateService

UserService --> ConfigService
ClientService --> ConfigService
ProjectService --> ConfigService

@enduml
```

### 4.2 微服务架构类图

#### 4.2.1 用户服务类图

```plantuml
@startuml
package "User Service" {
  
  interface UserController {
    +register(userData: RegisterDto): Promise<UserResponse>
    +login(credentials: LoginDto): Promise<LoginResponse>
    +getProfile(userId: string): Promise<UserProfile>
    +updateProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile>
    +changePassword(userId: string, data: ChangePasswordDto): Promise<void>
    +getUsersByRole(role: UserRole): Promise<User[]>
  }
  
  interface UserService {
    +createUser(userData: CreateUserDto): Promise<User>
    +findById(id: string): Promise<User>
    +findByEmail(email: string): Promise<User>
    +updateUser(id: string, data: UpdateUserDto): Promise<User>
    +deleteUser(id: string): Promise<void>
    +authenticateUser(email: string, password: string): Promise<AuthResult>
    +generateTokens(user: User): Promise<TokenPair>
    +validateToken(token: string): Promise<User>
    +assignRole(userId: string, roleId: string): Promise<void>
  }
  
  interface UserRepository {
    +save(user: User): Promise<User>
    +findById(id: string): Promise<User>
    +findByEmail(email: string): Promise<User>
    +findByUsername(username: string): Promise<User>
    +update(id: string, data: Partial<User>): Promise<User>
    +delete(id: string): Promise<void>
    +findByRole(role: UserRole): Promise<User[]>
  }
  
  class User {
    -id: string
    -username: string
    -email: string
    -passwordHash: string
    -fullName: string
    -avatar: string
    -phone: string
    -userType: UserType
    -isActive: boolean
    -roles: Role[]
    -createdAt: Date
    -updatedAt: Date
    
    +getId(): string
    +getEmail(): string
    +getUsername(): string
    +getFullName(): string
    +getUserType(): UserType
    +isAccountActive(): boolean
    +hasRole(role: string): boolean
    +getPermissions(): Permission[]
    +updateProfile(data: UpdateProfileDto): void
    +changePassword(newPassword: string): void
    +validatePassword(password: string): boolean
  }
  
  class Role {
    -id: string
    -name: string
    -description: string
    -permissions: Permission[]
    -isActive: boolean
    -createdAt: Date
    
    +getId(): string
    +getName(): string
    +getPermissions(): Permission[]
    +hasPermission(permission: Permission): boolean
    +addPermission(permission: Permission): void
    +removePermission(permission: Permission): void
  }
  
  class Permission {
    -id: string
    -name: string
    -resource: string
    -action: string
    -description: string
    
    +getId(): string
    +getName(): string
    +getResource(): string
    +getAction(): string
    +matches(resource: string, action: string): boolean
  }
  
  class AuthService {
    -jwtService: JwtService
    -hashService: HashService
    
    +hashPassword(password: string): Promise<string>
    +validatePassword(password: string, hash: string): Promise<boolean>
    +generateAccessToken(user: User): Promise<string>
    +generateRefreshToken(user: User): Promise<string>
    +validateToken(token: string): Promise<TokenPayload>
    +refreshTokens(refreshToken: string): Promise<TokenPair>
  }
  
  class CacheService {
    -redis: Redis
    
    +get<T>(key: string): Promise<T>
    +set<T>(key: string, value: T, ttl: number): Promise<void>
    +del(key: string): Promise<void>
    +exists(key: string): Promise<boolean>
  }
  
  ' 关系定义
  UserController --> UserService
  UserService --> UserRepository
  UserService --> AuthService
  UserService --> CacheService
  UserRepository --> User
  User --> Role
  Role --> Permission
  UserService ..> User : creates
  AuthService ..> User : authenticates
}

enum UserType {
  CLIENT
  PROJECT_MANAGER
  DEVELOPER
  ADMIN
  SYSTEM
}

enum PermissionAction {
  CREATE
  READ
  UPDATE
  DELETE
  ASSIGN
  APPROVE
}

@enduml
```

#### 4.2.2 项目服务类图

```plantuml
@startuml
package "Project Service" {
  
  interface ProjectController {
    +createProject(data: CreateProjectDto): Promise<ProjectResponse>
    +getProject(id: string): Promise<ProjectResponse>
    +updateProject(id: string, data: UpdateProjectDto): Promise<ProjectResponse>
    +deleteProject(id: string): Promise<void>
    +getProjectsByClient(clientId: string): Promise<ProjectResponse[]>
    +getProjectStatistics(projectId: string): Promise<ProjectStats>
    +assignTeamMember(projectId: string, data: AssignMemberDto): Promise<void>
    +updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void>
  }
  
  interface ProjectService {
    +createProject(data: CreateProjectDto): Promise<Project>
    +findById(id: string): Promise<Project>
    +findByClientId(clientId: string): Promise<Project[]>
    +updateProject(id: string, data: UpdateProjectDto): Promise<Project>
    +deleteProject(id: string): Promise<void>
    +assignTeamMember(projectId: string, userId: string, role: string): Promise<TeamMember>
    +removeTeamMember(projectId: string, userId: string): Promise<void>
    +updateStatus(projectId: string, status: ProjectStatus): Promise<void>
    +calculateProgress(projectId: string): Promise<number>
    +getProjectMetrics(projectId: string): Promise<ProjectMetrics>
  }
  
  interface ProjectRepository {
    +save(project: Project): Promise<Project>
    +findById(id: string): Promise<Project>
    +findByClientId(clientId: string): Promise<Project[]>
    +findByManagerId(managerId: string): Promise<Project[]>
    +findByStatus(status: ProjectStatus): Promise<Project[]>
    +update(id: string, data: Partial<Project>): Promise<Project>
    +delete(id: string): Promise<void>
    +getProjectStatistics(projectId: string): Promise<ProjectStatistics>
  }
  
  class Project {
    -id: string
    -projectName: string
    -projectCode: string
    -description: string
    -clientId: string
    -projectType: ProjectType
    -status: ProjectStatus
    -priority: Priority
    -budget: number
    -startDate: Date
    -endDate: Date
    -actualStartDate: Date
    -actualEndDate: Date
    -progressPercentage: number
    -projectManagerId: string
    -techLeadId: string
    -teamMembers: TeamMember[]
    -milestones: Milestone[]
    -techStack: string[]
    -metadata: Record<string, any>
    -createdAt: Date
    -updatedAt: Date
    
    +getId(): string
    +getProjectName(): string
    +getProjectCode(): string
    +getStatus(): ProjectStatus
    +getProgress(): number
    +getBudget(): number
    +getDuration(): number
    +getTeamSize(): number
    +addTeamMember(member: TeamMember): void
    +removeTeamMember(userId: string): void
    +updateProgress(percentage: number): void
    +updateStatus(status: ProjectStatus): void
    +addMilestone(milestone: Milestone): void
    +isOverdue(): boolean
    +isOnTrack(): boolean
    +calculateHealthScore(): number
  }
  
  class TeamMember {
    -id: string
    -projectId: string
    -userId: string
    -role: string
    -responsibilities: string[]
    -allocationPercentage: number
    -startDate: Date
    -endDate: Date
    -isActive: boolean
    
    +getId(): string
    +getUserId(): string
    +getRole(): string
    +getAllocationPercentage(): number
    +isCurrentlyAssigned(): boolean
    +updateAllocation(percentage: number): void
    +updateRole(role: string): void
    +updateResponsibilities(responsibilities: string[]): void
  }
  
  class Milestone {
    -id: string
    -projectId: string
    -name: string
    -description: string
    -plannedDate: Date
    -actualDate: Date
    -status: MilestoneStatus
    -completionPercentage: number
    -deliverables: Deliverable[]
    -dependencies: string[]
    
    +getId(): string
    +getName(): string
    +getStatus(): MilestoneStatus
    +getCompletionPercentage(): number
    +isCompleted(): boolean
    +isOverdue(): boolean
    +getDaysRemaining(): number
    +updateStatus(status: MilestoneStatus): void
    +markCompleted(): void
    +addDeliverable(deliverable: Deliverable): void
  }
  
  class Deliverable {
    -id: string
    -milestoneId: string
    -name: string
    -description: string
    -type: DeliverableType
    -status: DeliverableStatus
    -dueDate: Date
    -completedDate: Date
    -assigneeId: string
    -filePath: string
    
    +getId(): string
    +getName(): string
    +getStatus(): DeliverableStatus
    +isCompleted(): boolean
    +markCompleted(): void
    +assignTo(userId: string): void
    +updateDueDate(date: Date): void
  }
  
  class ProjectMetrics {
    -projectId: string
    -totalTasks: number
    -completedTasks: number
    -overdueTasks: number
    -teamProductivity: number
    -budgetUtilization: number
    -scheduleVariance: number
    -qualityScore: number
    -riskLevel: RiskLevel
    -clientSatisfaction: number
    
    +calculateHealthScore(): number
    +getEfficiencyRatio(): number
    +getBudgetVariance(): number
    +getScheduleHealth(): ScheduleHealth
    +getRiskIndicators(): RiskIndicator[]
  }
  
  interface ClientServiceClient {
    +getClientInfo(clientId: string): Promise<ClientInfo>
    +validateClientExists(clientId: string): Promise<boolean>
  }
  
  interface UserServiceClient {
    +getUserInfo(userId: string): Promise<UserInfo>
    +validateUserExists(userId: string): Promise<boolean>
    +getUsersByRole(role: string): Promise<UserInfo[]>
  }
  
  interface TaskServiceClient {
    +getProjectTasks(projectId: string): Promise<TaskSummary[]>
    +getTaskStatistics(projectId: string): Promise<TaskStatistics>
  }
  
  ' 关系定义
  ProjectController --> ProjectService
  ProjectService --> ProjectRepository
  ProjectService --> ClientServiceClient
  ProjectService --> UserServiceClient
  ProjectService --> TaskServiceClient
  ProjectRepository --> Project
  Project --> TeamMember
  Project --> Milestone
  Milestone --> Deliverable
  ProjectService ..> Project : creates
  ProjectService ..> ProjectMetrics : calculates
}

enum ProjectType {
  APP_DEVELOPMENT
  SYSTEM_INTEGRATION
  UI_UX_DESIGN
  TESTING
  CONSULTING
}

enum ProjectStatus {
  PLANNING
  DEVELOPMENT
  TESTING
  DELIVERED
  MAINTENANCE
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  DELAYED
  CANCELLED
}

enum DeliverableType {
  DOCUMENT
  CODE
  DESIGN
  TEST_REPORT
  DEPLOYMENT
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

@enduml
```

#### 4.2.3 任务服务类图

```plantuml
@startuml
package "Task Service" {
  
  interface TaskController {
    +createTask(data: CreateTaskDto): Promise<TaskResponse>
    +getTask(id: string): Promise<TaskResponse>
    +updateTask(id: string, data: UpdateTaskDto): Promise<TaskResponse>
    +deleteTask(id: string): Promise<void>
    +assignTask(taskId: string, data: AssignTaskDto): Promise<void>
    +updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>
    +getTasksByProject(projectId: string): Promise<TaskResponse[]>
    +getTasksByAssignee(userId: string): Promise<TaskResponse[]>
    +getTaskStatistics(projectId: string): Promise<TaskStatistics>
  }
  
  interface TaskService {
    +createTask(data: CreateTaskDto): Promise<Task>
    +findById(id: string): Promise<Task>
    +findByProjectId(projectId: string): Promise<Task[]>
    +findByAssigneeId(userId: string): Promise<Task[]>
    +updateTask(id: string, data: UpdateTaskDto): Promise<Task>
    +deleteTask(id: string): Promise<void>
    +assignTask(taskId: string, userId: string): Promise<void>
    +updateStatus(taskId: string, status: TaskStatus): Promise<void>
    +updateProgress(taskId: string, percentage: number): Promise<void>
    +addComment(taskId: string, comment: TaskComment): Promise<TaskComment>
    +logTimeEntry(taskId: string, timeEntry: TimeEntry): Promise<TimeEntry>
    +getTaskStatistics(projectId: string): Promise<TaskStatistics>
    +getTaskDependencies(taskId: string): Promise<Task[]>
  }
  
  interface TaskRepository {
    +save(task: Task): Promise<Task>
    +findById(id: string): Promise<Task>
    +findByProjectId(projectId: string): Promise<Task[]>
    +findByAssigneeId(userId: string): Promise<Task[]>
    +findByStatus(status: TaskStatus): Promise<Task[]>
    +findByPriority(priority: Priority): Promise<Task[]>
    +update(id: string, data: Partial<Task>): Promise<Task>
    +delete(id: string): Promise<void>
    +findOverdueTasks(): Promise<Task[]>
    +getTaskStatistics(projectId: string): Promise<TaskStatistics>
  }
  
  class Task {
    -id: string
    -projectId: string
    -milestoneId: string
    -parentTaskId: string
    -title: string
    -description: string
    -taskType: TaskType
    -status: TaskStatus
    -priority: Priority
    -assigneeId: string
    -createdById: string
    -estimatedHours: number
    -actualHours: number
    -startDate: Date
    -dueDate: Date
    -completionDate: Date
    -completionPercentage: number
    -tags: string[]
    -attachments: Attachment[]
    -comments: TaskComment[]
    -timeEntries: TimeEntry[]
    -dependencies: string[]
    -subtasks: Task[]
    -metadata: Record<string, any>
    -createdAt: Date
    -updatedAt: Date
    
    +getId(): string
    +getTitle(): string
    +getDescription(): string
    +getStatus(): TaskStatus
    +getPriority(): Priority
    +getAssigneeId(): string
    +getEstimatedHours(): number
    +getActualHours(): number
    +getCompletionPercentage(): number
    +isOverdue(): boolean
    +isCompleted(): boolean
    +getDaysRemaining(): number
    +getEffortVariance(): number
    +updateStatus(status: TaskStatus): void
    +updateProgress(percentage: number): void
    +assignTo(userId: string): void
    +addComment(comment: TaskComment): void
    +addTimeEntry(timeEntry: TimeEntry): void
    +addSubtask(subtask: Task): void
    +addDependency(taskId: string): void
    +canStart(): boolean
    +markCompleted(): void
  }
  
  class TaskComment {
    -id: string
    -taskId: string
    -authorId: string
    -content: string
    -commentType: CommentType
    -isInternal: boolean
    -attachments: Attachment[]
    -createdAt: Date
    -updatedAt: Date
    
    +getId(): string
    +getContent(): string
    +getAuthorId(): string
    +getCommentType(): CommentType
    +isInternalComment(): boolean
    +addAttachment(attachment: Attachment): void
    +updateContent(content: string): void
  }
  
  class TimeEntry {
    -id: string
    -taskId: string
    -userId: string
    -description: string
    -hoursSpent: number
    -workDate: Date
    -entryType: TimeEntryType
    -billable: boolean
    -approved: boolean
    -approvedBy: string
    -createdAt: Date
    
    +getId(): string
    +getHoursSpent(): number
    +getWorkDate(): Date
    +isBillable(): boolean
    +isApproved(): boolean
    +approve(approverId: string): void
    +updateHours(hours: number): void
    +updateDescription(description: string): void
  }
  
  class Attachment {
    -id: string
    -fileName: string
    -fileSize: number
    -mimeType: string
    -filePath: string
    -uploadedBy: string
    -uploadedAt: Date
    
    +getId(): string
    +getFileName(): string
    +getFileSize(): number
    +getFilePath(): string
    +getUploadedBy(): string
    +isImage(): boolean
    +isDocument(): boolean
  }
  
  class TaskStatistics {
    -projectId: string
    -totalTasks: number
    -completedTasks: number
    -inProgressTasks: number
    -blockedTasks: number
    -overdueTasks: number
    -averageCompletionTime: number
    -teamProductivity: number
    -burndownData: BurndownPoint[]
    -velocityTrend: VelocityPoint[]
    
    +getCompletionRate(): number
    +getOverdueRate(): number
    +getAverageVelocity(): number
    +getProductivityTrend(): TrendDirection
    +generateBurndownChart(): BurndownChart
    +generateVelocityChart(): VelocityChart
  }
  
  class BurndownPoint {
    -date: Date
    -remainingWork: number
    -idealRemaining: number
    -actualCompleted: number
    
    +getDate(): Date
    +getRemainingWork(): number
    +getVariance(): number
  }
  
  class VelocityPoint {
    -sprintNumber: number
    -completedStoryPoints: number
    -committedStoryPoints: number
    -teamSize: number
    
    +getVelocity(): number
    +getCapacityUtilization(): number
  }
  
  interface ProjectServiceClient {
    +getProjectInfo(projectId: string): Promise<ProjectInfo>
    +validateProjectExists(projectId: string): Promise<boolean>
    +updateProjectProgress(projectId: string, progress: number): Promise<void>
  }
  
  interface UserServiceClient {
    +getUserInfo(userId: string): Promise<UserInfo>
    +validateUserExists(userId: string): Promise<boolean>
    +notifyUser(userId: string, notification: NotificationData): Promise<void>
  }
  
  interface NotificationServiceClient {
    +sendTaskAssignment(taskId: string, assigneeId: string): Promise<void>
    +sendTaskStatusUpdate(taskId: string, status: TaskStatus): Promise<void>
    +sendOverdueReminder(taskId: string): Promise<void>
  }
  
  ' 关系定义
  TaskController --> TaskService
  TaskService --> TaskRepository
  TaskService --> ProjectServiceClient
  TaskService --> UserServiceClient
  TaskService --> NotificationServiceClient
  TaskRepository --> Task
  Task --> TaskComment
  Task --> TimeEntry
  Task --> Attachment
  TaskService ..> TaskStatistics : calculates
  TaskStatistics --> BurndownPoint
  TaskStatistics --> VelocityPoint
}

enum TaskType {
  DEVELOPMENT
  DESIGN
  TESTING
  DOCUMENTATION
  REVIEW
  MEETING
  RESEARCH
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  TESTING
  COMPLETED
  BLOCKED
  CANCELLED
}

enum CommentType {
  GENERAL
  STATUS_UPDATE
  QUESTION
  SOLUTION
  ISSUE
}

enum TimeEntryType {
  DEVELOPMENT
  TESTING
  DESIGN
  MEETING
  RESEARCH
  DOCUMENTATION
}

@enduml
```

### 4.3 核心业务流程时序图

#### 4.3.1 用户登录认证时序图

```plantuml
@startuml
title "User Login Authentication Flow"

actor User as user
participant Frontend as frontend
participant Gateway as gateway
participant UserService as userService
participant AuthService as authService
participant Cache as cache
participant Database as database

user -> frontend: 1. 输入登录信息
frontend -> gateway: 2. POST /api/v1/auth/login
gateway -> userService: 3. 转发登录请求

userService -> userService: 4. 验证请求参数
userService -> database: 5. 查询用户信息
database -> userService: 6. 返回用户数据

alt 用户存在且密码正确
    userService -> authService: 7. 验证密码
    authService -> userService: 8. 密码验证成功
    
    userService -> authService: 9. 生成JWT令牌
    authService -> userService: 10. 返回访问令牌和刷新令牌
    
    userService -> cache: 11. 缓存用户会话信息
    cache -> userService: 12. 缓存成功
    
    userService -> database: 13. 更新最后登录时间
    database -> userService: 14. 更新成功
    
    userService -> gateway: 15. 返回登录成功响应
    gateway -> frontend: 16. 返回用户信息和令牌
    frontend -> user: 17. 登录成功，跳转到主页
    
else 用户不存在或密码错误
    userService -> gateway: 18. 返回登录失败响应
    gateway -> frontend: 19. 返回错误信息
    frontend -> user: 20. 显示登录失败提示
end

@enduml
```

#### 4.3.2 项目创建流程时序图

```plantuml
@startuml
title "Project Creation Flow"

actor PM as pm
participant Frontend as frontend
participant Gateway as gateway
participant ProjectService as projectService
participant ClientService as clientService
participant UserService as userService
participant NotificationService as notificationService
participant Database as database
participant Cache as cache

pm -> frontend: 1. Fill project info
frontend -> gateway: 2. POST /api/v1/projects
gateway -> gateway: 3. Validate JWT token
gateway -> projectService: 4. Forward creation request

projectService -> projectService: 5. Validate request params
projectService -> clientService: 6. Verify client exists
clientService -> database: 7. Query client info
database -> clientService: 8. Return client data
clientService -> projectService: 9. Client validation success

projectService -> userService: 10. Verify PM permissions
userService -> projectService: 11. Permission validation success

projectService -> projectService: 12. Generate project ID
projectService -> database: 13. Save project info
database -> projectService: 14. Project created successfully

projectService -> cache: 15. Cache project info
cache -> projectService: 16. Cache success

par
projectService -> notificationService: 17a. Notify client
notificationService -> clientService: 18a. Get client contact
clientService -> notificationService: 19a. Return contact info
projectService -> notificationService: 17b. Notify team members
notificationService -> userService: 18b. Get team member info
userService -> notificationService: 19b. Return member info
end

projectService -> gateway: 20. Return creation success response
gateway -> frontend: 21. Return project info
frontend -> pm: 22. Show creation success

@enduml
```

#### 4.3.3 任务分配流程时序图

```plantuml
@startuml
title "Task Assignment Flow"

actor PM as pm
actor Developer as dev
participant Frontend as frontend
participant Gateway as gateway
participant TaskService as taskService
participant ProjectService as projectService
participant UserService as userService
participant CollaborationService as collaborationService
participant NotificationService as notificationService
participant Database as database

pm -> frontend: 1. Select task and developer
frontend -> gateway: 2. PUT /api/v1/tasks/{taskId}/assign
gateway -> taskService: 3. Forward assignment request

taskService -> taskService: 4. Validate request params
taskService -> database: 5. Query task info
database -> taskService: 6. Return task data

taskService -> projectService: 7. Verify project permissions
projectService -> taskService: 8. Permission validation success

taskService -> userService: 9. Verify assigned user
userService -> database: 10. Query user info
database -> userService: 11. Return user data
userService -> taskService: 12. User validation success

taskService -> database: 13. Update task assignment
database -> taskService: 14. Assignment success

par
taskService -> collaborationService: 15a. Send real-time message
collaborationService -> dev: 16a. WebSocket push assignment notification
taskService -> notificationService: 15b. Send assignment notification
notificationService -> userService: 16b. Get user email
userService -> notificationService: 17b. Return email info
end

par
taskService -> projectService: 15c. Update project progress
projectService -> database: 16c. Update project data
database -> projectService: 17c. Update success
end

taskService -> gateway: 18. Return assignment success response
gateway -> frontend: 19. Return task info
frontend -> pm: 20. Show assignment success

@enduml
```

#### 4.3.4 实时协作消息流程时序图

```plantuml
@startuml
title "Real-time Collaboration Message Flow"

actor User1 as user1
actor User2 as user2
actor User3 as user3
participant Frontend1 as frontend1
participant Frontend2 as frontend2
participant Frontend3 as frontend3
participant Gateway as gateway
participant CollaborationService as collaborationService
participant ProjectService as projectService
participant UserService as userService
participant WSServer as wsServer
participant MessageQueue as mq
participant Database as database

note over user1, database: "WebSocket Connection Setup"
user1 -> frontend1: 1. Enter project collaboration page
frontend1 -> wsServer: 2. Establish WebSocket connection
wsServer -> collaborationService: 3. Verify user identity
collaborationService -> userService: 4. Verify user permissions
userService -> collaborationService: 5. Permission validation success
collaborationService -> wsServer: 6. Join project room
wsServer -> frontend1: 7. Connection established successfully

note over user2, user3: "Other Users Connect"
par
user2 -> frontend2: 8a. Enter collaboration page
frontend2 -> wsServer: 9a. Establish connection
wsServer -> collaborationService: 10a. Verify and join room
user3 -> frontend3: 8b. Enter collaboration page
frontend3 -> wsServer: 9b. Establish connection
wsServer -> collaborationService: 10b. Verify and join room
end

note over user1, database: "Send Message Flow"
user1 -> frontend1: 11. Input and send message
frontend1 -> wsServer: 12. Send message data
wsServer -> collaborationService: 13. Process message
collaborationService -> collaborationService: 14. Validate message content

par
collaborationService -> database: 15a. Save message to database
database -> collaborationService: 16a. Save success
collaborationService -> mq: 15b. Publish message to queue
mq -> collaborationService: 16b. Publish success
collaborationService -> wsServer: 15c. Broadcast message to room
wsServer -> frontend1: 16c. Push to user1 (echo)
wsServer -> frontend2: 17c. Push to user2
wsServer -> frontend3: 18c. Push to user3
end

note over user2, user3: "Users Receive Messages"
frontend2 -> user2: 19. Display new message
frontend3 -> user3: 20. Display new message

note over user2, frontend3: "File Sharing Flow"
user2 -> frontend2: 21. Upload file
frontend2 -> gateway: 22. POST /api/v1/files/upload
gateway -> collaborationService: 23. Forward file upload request
collaborationService -> collaborationService: 24. Save file and generate message
collaborationService -> wsServer: 25. Broadcast file message
wsServer -> frontend1: 26. Push file message to user1
wsServer -> frontend3: 27. Push file message to user3

note over user3, frontend2: "Status Update Flow"
user3 -> frontend3: 28. Start typing
frontend3 -> wsServer: 29. Send typing event
wsServer -> collaborationService: 30. Process typing event
collaborationService -> wsServer: 31. Broadcast typing status
wsServer -> frontend1: 32. Notify user1 someone is typing
wsServer -> frontend2: 33. Notify user2 someone is typing

@enduml
```

#### 4.3.5 工单处理流程时序图

```plantuml
@startuml
title "Support Ticket Processing Flow"

actor Client as client
actor Agent as agent
participant Frontend as frontend
participant Gateway as gateway
participant SupportService as supportService
participant UserService as userService
participant ClientService as clientService
participant NotificationService as notificationService
participant KnowledgeService as knowledgeService
participant Database as database
participant SLAMonitor as slaMonitor

note over client, slaMonitor: "Ticket Creation Stage"
client -> frontend: 1. Submit technical support request
frontend -> gateway: 2. POST /api/v1/support/tickets
gateway -> supportService: 3. Forward ticket creation request

supportService -> supportService: 4. Validate request parameters
supportService -> supportService: 5. Generate ticket number
supportService -> supportService: 6. Analyze issue category and priority

par
supportService -> clientService: 7a. Verify client information
clientService -> supportService: 8a. Return client data
supportService -> knowledgeService: 7b. Search related knowledge base
knowledgeService -> supportService: 8b. Return related articles
end

supportService -> database: 9. Save ticket information
database -> supportService: 10. Ticket creation success

supportService -> slaMonitor: 11. Set SLA deadline
slaMonitor -> supportService: 12. SLA monitoring started

supportService -> supportService: 13. Auto-assign support engineer
supportService -> database: 14. Update assignment information
database -> supportService: 15. Assignment success

par
supportService -> notificationService: 16a. Notify client ticket created
notificationService -> clientService: 17a. Get client contact info
clientService -> notificationService: 18a. Return contact information
notificationService -> client: 19a. Send confirmation email
supportService -> notificationService: 16b. Notify assigned support engineer
notificationService -> userService: 17b. Get engineer contact info
userService -> notificationService: 18b. Return contact information
notificationService -> agent: 19b. Send ticket assignment notification
end

supportService -> gateway: 20. Return ticket creation success response
gateway -> frontend: 21. Return ticket information
frontend -> client: 22. Display ticket number and next steps

note over agent, frontend: "Ticket Processing Stage"
agent -> frontend: 23. View assigned tickets
frontend -> gateway: 24. GET /api/v1/support/tickets/{ticketId}
gateway -> supportService: 25. Forward query request
supportService -> database: 26. Query ticket details
database -> supportService: 27. Return ticket data
supportService -> gateway: 28. Return ticket information
gateway -> frontend: 29. Return ticket details
frontend -> agent: 30. Display ticket details

agent -> frontend: 31. Update ticket status to "In Progress"
frontend -> gateway: 32. PUT /api/v1/support/tickets/{ticketId}/status
gateway -> supportService: 33. Forward status update request
supportService -> database: 34. Update ticket status
database -> supportService: 35. Update success

supportService -> notificationService: 36. Notify client of status change
notificationService -> client: 37. Send status update notification

agent -> frontend: 38. Add processing comments
frontend -> gateway: 39. POST /api/v1/support/tickets/{ticketId}/comments
gateway -> supportService: 40. Forward comment addition request
supportService -> database: 41. Save comment information
database -> supportService: 42. Save success

supportService -> notificationService: 43. Notify client of new reply
notificationService -> client: 44. Send new reply notification

note over agent, supportService: "Ticket Resolution Stage"
agent -> frontend: 45. Provide solution and close ticket
frontend -> gateway: 46. PUT /api/v1/support/tickets/{ticketId}/resolve
gateway -> supportService: 47. Forward ticket resolution request

supportService -> database: 48. Update ticket to resolved status
database -> supportService: 49. Update success

supportService -> slaMonitor: 50. Stop SLA monitoring
slaMonitor -> supportService: 51. Calculate SLA metrics

par
supportService -> notificationService: 52a. Send satisfaction survey
notificationService -> client: 53a. Push satisfaction questionnaire
supportService -> knowledgeService: 52b. Update knowledge base
knowledgeService -> supportService: 53b. Knowledge base update success
end

supportService -> gateway: 54. Return ticket resolution success response
gateway -> frontend: 55. Return processing result
frontend -> agent: 56. Display ticket processing completed

@enduml
```

#### 4.3.6 AI代码生成流程时序图

```plantuml
@startuml
title "AI Code Generation Flow"

actor Developer as dev
participant Frontend as frontend
participant Gateway as gateway
participant AIService as aiService
participant TemplateService as templateService
participant UserService as userService
participant ProjectService as projectService
participant AIEngine as aiEngine
participant CodeRepo as codeRepo
participant Database as database
participant Cache as cache

note over dev, cache: "Template Selection Stage"
dev -> frontend: 1. Enter code generation page
frontend -> gateway: 2. GET /api/v1/dev-tools/templates
gateway -> templateService: 3. Forward template query request

templateService -> cache: 4. Query template cache
cache -> templateService: 5. Return cached data
alt Cache miss
    templateService -> database: 6. Query template data
    database -> templateService: 7. Return template list
    templateService -> cache: 8. Update cache
end

templateService -> gateway: 9. Return template list
gateway -> frontend: 10. Return template data
frontend -> dev: 11. Display available templates

dev -> frontend: 12. Select template and fill parameters
frontend -> gateway: 13. POST /api/v1/dev-tools/generate
gateway -> aiService: 14. Forward code generation request

note over aiService, projectService: "Permission Verification and Project Context"
aiService -> userService: 15. Verify user permissions
userService -> aiService: 16. Permission validation success

aiService -> projectService: 17. Get project context
projectService -> aiService: 18. Return project tech stack info

note over aiService, aiEngine: "Code Generation Stage"
aiService -> templateService: 19. Get template details
templateService -> aiService: 20. Return template content

aiService -> aiService: 21. Analyze generation requirements
aiService -> codeRepo: 22. Get related code examples
codeRepo -> aiService: 23. Return code references

aiService -> aiEngine: 24. Call AI generation engine
aiEngine -> aiEngine: 25. Generate code based on template and context

par
aiEngine -> aiEngine: 26a. Generate core business code
aiEngine -> aiEngine: 26b. Generate test code
aiEngine -> aiEngine: 26c. Generate documentation comments
end

aiEngine -> aiService: 27. Return generated code

note over aiService: "Code Quality Check"
aiService -> aiService: 28. Syntax check
aiService -> aiService: 29. Code standard check
aiService -> aiService: 30. Security vulnerability check

alt Code quality passed
    aiService -> aiService: 31. Format code
    aiService -> database: 32. Save generation record
    database -> aiService: 33. Save success
    
    aiService -> gateway: 34. Return generation success response
    gateway -> frontend: 35. Return generated code
    frontend -> dev: 36. Display generation result
    
    dev -> frontend: 37. Preview and download code
    frontend -> gateway: 38. GET /api/v1/dev-tools/download/{generationId}
    gateway -> aiService: 39. Forward download request
    aiService -> frontend: 40. Return code file
    frontend -> dev: 41. Download code file
    
else Code quality failed
    aiService -> gateway: 42. Return quality check failure
    gateway -> frontend: 43. Return error information
    frontend -> dev: 44. Display regeneration suggestion
end

note over dev, aiEngine: "Code Optimization Suggestions"
opt User requests optimization suggestions
    dev -> frontend: 45. Request code optimization suggestions
    frontend -> gateway: 46. POST /api/v1/dev-tools/optimize
    gateway -> aiService: 47. Forward optimization request
    
    aiService -> aiEngine: 48. Analyze code performance
    aiEngine -> aiService: 49. Return optimization suggestions
    
    aiService -> gateway: 50. Return optimization suggestions
    gateway -> frontend: 51. Return suggestion list
    frontend -> dev: 52. Display optimization suggestions
end

@enduml
```

### 4.4 微服务间通信设计

#### 4.4.1 服务通信矩阵

```plantuml
@startuml
title "Service Communication Matrix"

package "Service Communication Relationships" {
  rectangle "User Service" as UserService
  rectangle "Client Service" as ClientService  
  rectangle "Project Service" as ProjectService
  rectangle "Task Service" as TaskService
  rectangle "Collaboration Service" as CollaborationService
  rectangle "Support Service" as SupportService
  rectangle "AI Service" as AIService
  rectangle "Notification Service" as NotificationService
}

ClientService --> UserService : HTTP
ProjectService --> UserService : HTTP
ProjectService --> ClientService : HTTP
TaskService --> UserService : HTTP
TaskService --> ProjectService : HTTP
CollaborationService --> UserService : HTTP
CollaborationService --> ProjectService : HTTP
SupportService --> UserService : HTTP
SupportService --> ClientService : HTTP
AIService --> UserService : HTTP
AIService --> ProjectService : HTTP
NotificationService --> UserService : HTTP
NotificationService --> ClientService : HTTP
NotificationService --> ProjectService : HTTP
NotificationService --> TaskService : HTTP

UserService ..> NotificationService : gRPC
ClientService ..> NotificationService : gRPC
ProjectService ..> NotificationService : gRPC
TaskService ..> NotificationService : gRPC
SupportService ..> NotificationService : gRPC
AIService ..> NotificationService : gRPC

TaskService <==> CollaborationService : WebSocket
NotificationService <==> CollaborationService : WebSocket

note bottom
Communication Protocols:
-> HTTP: RESTful API calls
..> gRPC: High-performance RPC calls
<==> WebSocket: Real-time bidirectional communication
end note

@enduml
```

#### 4.4.2 事件驱动架构

```plantuml
@startuml
title "Event-Driven Architecture Design"

package "Event Publishers" {
  rectangle "User Service" as UserPub {
    rectangle "User Registered" as UserRegistered
    rectangle "User Logged In" as UserLoggedIn
    rectangle "Password Changed" as PasswordChanged
  }
  
  rectangle "Project Service" as ProjectPub {
    rectangle "Project Created" as ProjectCreated
    rectangle "Project Status Changed" as ProjectStatusChanged
    rectangle "Project Completed" as ProjectCompleted
  }
  
  rectangle "Task Service" as TaskPub {
    rectangle "Task Assigned" as TaskAssigned
    rectangle "Task Completed" as TaskCompleted
    rectangle "Task Overdue" as TaskOverdue
  }
}

package "Message Middleware" {
  rectangle "Apache Kafka" as Kafka {
    rectangle "User Events Topic" as UserTopic
    rectangle "Project Events Topic" as ProjectTopic
    rectangle "Task Events Topic" as TaskTopic
    rectangle "Notification Events Topic" as NotificationTopic
  }
}

package "Event Consumers" {
  rectangle "Notification Service" as NotificationSub {
    rectangle "Email Notification Consumer" as EmailConsumer
    rectangle "SMS Notification Consumer" as SMSConsumer
    rectangle "Internal Message Consumer" as InternalMsgConsumer
  }
  
  rectangle "Statistics Service" as StatsSub {
    rectangle "User Behavior Stats" as UserStats
    rectangle "Project Progress Stats" as ProjectStats
    rectangle "Task Efficiency Stats" as TaskStats
  }
  
  rectangle "Audit Service" as AuditSub {
    rectangle "Operation Log Record" as AuditLog
    rectangle "Security Event Record" as SecurityLog
  }
}

UserRegistered -> UserTopic
UserLoggedIn -> UserTopic
PasswordChanged -> UserTopic

ProjectCreated -> ProjectTopic
ProjectStatusChanged -> ProjectTopic
ProjectCompleted -> ProjectTopic

TaskAssigned -> TaskTopic
TaskCompleted -> TaskTopic
TaskOverdue -> TaskTopic

UserTopic -> EmailConsumer
UserTopic -> UserStats
UserTopic -> AuditLog

ProjectTopic -> EmailConsumer
ProjectTopic -> ProjectStats
ProjectTopic -> AuditLog

TaskTopic -> EmailConsumer
TaskTopic -> SMSConsumer
TaskTopic -> TaskStats
TaskTopic -> AuditLog

@enduml
```

这些详细的类图和时序图设计为微服务架构提供了：

1. **完整的类结构设计**：每个微服务的核心类、接口和关系
2. **详细的业务流程**：跨服务的完整时序图
3. **服务间通信机制**：HTTP、gRPC、WebSocket等多种通信方式
4. **事件驱动架构**：异步事件处理和消息传递机制

这样的设计确保了微服务架构的：
- **松耦合**：服务间通过明确的接口和事件进行通信
- **高内聚**：每个服务内部业务逻辑完整
- **可扩展性**：每个服务可以独立扩展
- **可维护性**：清晰的架构边界和通信机制

## 5. 模块详细设计

### 5.1 服务展示模块

#### 5.1.1 功能描述
服务展示模块负责展示公司的车载应用开发服务能力，包括服务介绍、技术栈展示、成功案例、开发流程等。

#### 5.1.2 子模块设计

```plantuml
@startuml
package "ServiceDisplayModule" {
  rectangle "ServiceCapabilities" as capability {
    rectangle "FullStackDev" as fullstack
    rectangle "SystemIntegration" as integration
    rectangle "UIUXDesign" as design
    rectangle "TestingValidation" as testing
  }
  
  rectangle "TechStackDisplay" as techstack {
    rectangle "FrontendTech" as frontend_tech
    rectangle "BackendTech" as backend_tech
    rectangle "DatabaseTech" as database_tech
    rectangle "DevToolchain" as dev_tools
  }
  
  rectangle "SuccessCases" as cases {
    rectangle "NavigationApp" as nav_case
    rectangle "EntertainmentSystem" as entertainment_case
    rectangle "VoiceAssistant" as voice_case
    rectangle "VehicleControl" as control_case
  }
  
  rectangle "DevelopmentProcess" as process {
    rectangle "RequirementAnalysis" as requirement_process
    rectangle "DesignDevelopment" as design_process
    rectangle "TestingValidation" as test_process
    rectangle "DeliveryOps" as delivery_process
  }
}
@enduml
```

#### 5.1.3 核心类设计

```typescript
// 服务能力实体
interface ServiceCapability {
  id: string;
  name: string;
  description: string;
  category: 'Frontend' | 'Backend' | 'Integration' | 'Testing' | 'Design';
  technologies: string[];
  features: string[];
  advantages: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 成功案例实体
interface SuccessCase {
  id: string;
  title: string;
  description: string;
  clientName: string;
  projectType: 'Navigation' | 'Entertainment' | 'VoiceAssistant' | 'VehicleControl';
  duration: string;
  teamSize: number;
  technologies: string[];
  achievements: string[];
  screenshots: string[];
  testimonial?: string;
  isFeatured: boolean;
  isPublic: boolean;
  createdAt: Date;
}

// 服务展示服务类
class ServiceDisplayService {
  // 获取服务能力列表
  async getCapabilities(category?: string): Promise<ServiceCapability[]>;
  
  // 获取成功案例列表
  async getCases(filter?: CaseFilter): Promise<SuccessCase[]>;
  
  // 获取案例详情
  async getCaseDetail(caseId: string): Promise<SuccessCase>;
  
  // 获取技术栈信息
  async getTechStack(): Promise<TechStack>;
  
  // 获取开发流程信息
  async getDevelopmentProcess(): Promise<DevelopmentProcess>;
}
```

#### 5.1.4 数据库设计

```sql
-- 服务能力表
CREATE TABLE service_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    technologies JSONB,
    features JSONB,
    advantages JSONB,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 成功案例表
CREATE TABLE success_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_name VARCHAR(255),
    project_type VARCHAR(50) NOT NULL,
    duration VARCHAR(100),
    team_size INTEGER,
    technologies JSONB,
    achievements JSONB,
    screenshots JSONB,
    testimonial TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_capabilities_category ON service_capabilities(category);
CREATE INDEX idx_capabilities_active ON service_capabilities(is_active);
CREATE INDEX idx_cases_type ON success_cases(project_type);
CREATE INDEX idx_cases_featured ON success_cases(is_featured);
```

### 5.2 客户管理模块

#### 5.2.1 功能描述
客户管理模块负责管理客户信息、项目信息、合同管理、需求评估等客户关系管理功能。

#### 5.2.2 子模块设计

```plantuml
@startuml
package "客户管理模块" {
  rectangle "客户信息管理" as client_info {
    rectangle "客户档案管理" as client_profile
    rectangle "联系人管理" as contact_mgmt
    rectangle "合作历史" as cooperation_history
    rectangle "客户分级" as client_classification
  }
  
  rectangle "项目管理" as project_mgmt {
    rectangle "项目立项" as project_creation
    rectangle "资源分配" as resource_allocation
    rectangle "进度跟踪" as progress_tracking
    rectangle "质量监控" as quality_monitoring
  }
  
  rectangle "合同管理" as contract_mgmt {
    rectangle "合同签署" as contract_signing
    rectangle "执行跟踪" as execution_tracking
    rectangle "变更管理" as change_mgmt
    rectangle "付款管理" as payment_mgmt
  }
  
  rectangle "需求评估" as requirement_eval {
    rectangle "需求收集" as requirement_collection
    rectangle "技术评估" as technical_evaluation
    rectangle "成本估算" as cost_estimation
    rectangle "方案设计" as solution_design
  }
}
@enduml
```

#### 5.2.3 核心类设计

```typescript
// 客户实体
interface Client {
  id: string;
  companyName: string;
  clientType: 'OEM' | 'Tier1' | 'SystemIntegrator' | 'Startup';
  industry: string;
  scale: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  country: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  cooperationLevel: 'Strategic' | 'Regular' | 'Potential';
  status: 'Active' | 'Inactive' | 'Suspended';
  contacts: Contact[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

// 项目实体
interface Project {
  id: string;
  projectName: string;
  clientId: string;
  projectType: 'AppDevelopment' | 'SystemIntegration' | 'UIUXDesign' | 'Testing';
  description: string;
  techStack: string[];
  budget: number;
  startDate: Date;
  endDate: Date;
  status: 'Planning' | 'Development' | 'Testing' | 'Delivered' | 'Maintenance';
  projectManagerId: string;
  teamMembers: TeamMember[];
  milestones: Milestone[];
  deliverables: Deliverable[];
  createdAt: Date;
  updatedAt: Date;
}

// 客户管理服务类
class ClientManagementService {
  // 创建客户
  async createClient(clientData: CreateClientDto): Promise<Client>;
  
  // 更新客户信息
  async updateClient(clientId: string, updateData: UpdateClientDto): Promise<Client>;
  
  // 获取客户列表
  async getClients(filter?: ClientFilter): Promise<Client[]>;
  
  // 获取客户详情
  async getClientDetail(clientId: string): Promise<Client>;
  
  // 创建项目
  async createProject(projectData: CreateProjectDto): Promise<Project>;
  
  // 更新项目状态
  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void>;
  
  // 分配项目资源
  async assignProjectResources(projectId: string, resources: ProjectResource[]): Promise<void>;
}
```

### 5.3 项目协作模块

#### 5.3.1 功能描述
项目协作模块提供在线项目管理、任务分配、进度跟踪、文档共享、客户沟通等协作功能。

#### 5.3.2 核心功能设计

```plantuml
@startuml
package "项目协作模块" {
  rectangle "任务管理" as task_mgmt {
    rectangle "任务创建分配" as task_creation
    rectangle "任务状态跟踪" as task_tracking
    rectangle "任务依赖管理" as task_dependency
    rectangle "任务优先级" as task_priority
  }
  
  rectangle "进度管理" as progress_mgmt {
    rectangle "里程碑管理" as milestone_mgmt
    rectangle "甘特图展示" as gantt_chart
    rectangle "进度报告" as progress_report
    rectangle "风险预警" as risk_warning
  }
  
  rectangle "文档协作" as doc_collab {
    rectangle "文档上传下载" as doc_upload
    rectangle "版本控制" as version_control
    rectangle "在线编辑" as online_edit
    rectangle "权限管理" as doc_permission
  }
  
  rectangle "沟通协作" as communication {
    rectangle "即时消息" as instant_message
    rectangle "视频会议" as video_conference
    rectangle "讨论区" as discussion_forum
    rectangle "通知推送" as notification
  }
}
@enduml
```

#### 5.3.3 实时通信设计

```typescript
// WebSocket连接管理
class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  
  // 建立连接
  connect(userId: string, projectId: string): void;
  
  // 断开连接
  disconnect(userId: string): void;
  
  // 广播消息
  broadcast(projectId: string, message: Message): void;
  
  // 发送私信
  sendPrivateMessage(fromUserId: string, toUserId: string, message: Message): void;
}

// 消息类型定义
interface Message {
  id: string;
  type: 'text' | 'file' | 'task_update' | 'progress_update' | 'system_notification';
  content: string;
  senderId: string;
  projectId: string;
  timestamp: Date;
  metadata?: any;
}

// 项目协作服务
class ProjectCollaborationService {
  // 创建任务
  async createTask(taskData: CreateTaskDto): Promise<Task>;
  
  // 更新任务状态
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>;
  
  // 上传文档
  async uploadDocument(projectId: string, file: File, metadata: DocumentMetadata): Promise<Document>;
  
  // 发送消息
  async sendMessage(projectId: string, message: CreateMessageDto): Promise<Message>;
  
  // 创建里程碑
  async createMilestone(projectId: string, milestoneData: CreateMilestoneDto): Promise<Milestone>;
}
```

### 5.4 技术支持模块

#### 5.4.1 功能描述
技术支持模块提供工单管理、知识库、远程支持、FAQ管理、客户培训等技术支持功能。

#### 5.4.2 工单系统设计

```typescript
// 工单实体
interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  clientId: string;
  projectId?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Technical' | 'Account' | 'Billing' | 'FeatureRequest';
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
  assignedTo?: string;
  attachments: Attachment[];
  comments: TicketComment[];
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
  slaDeadline: Date;
}

// 工单服务
class SupportTicketService {
  // 创建工单
  async createTicket(ticketData: CreateTicketDto): Promise<SupportTicket>;
  
  // 分配工单
  async assignTicket(ticketId: string, assigneeId: string): Promise<void>;
  
  // 更新工单状态
  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void>;
  
  // 添加评论
  async addComment(ticketId: string, comment: CreateCommentDto): Promise<TicketComment>;
  
  // 解决工单
  async resolveTicket(ticketId: string, resolution: string): Promise<void>;
  
  // 计算SLA指标
  async calculateSLAMetrics(timeRange: DateRange): Promise<SLAMetrics>;
}
```

### 5.5 开发辅助工具模块

#### 5.5.1 功能描述
开发辅助工具模块提供代码生成、项目模板、AI辅助开发等工具，提升开发效率。

#### 5.5.2 代码生成工具设计

```typescript
// 代码模板实体
interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Component' | 'Service' | 'Model' | 'Test' | 'Config';
  platform: 'Android' | 'QNX' | 'Linux' | 'Web';
  language: 'Java' | 'Kotlin' | 'C++' | 'JavaScript' | 'TypeScript';
  template: string;
  parameters: TemplateParameter[];
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// AI辅助开发服务
class AIAssistantService {
  // 代码补全
  async codeCompletion(context: CodeContext): Promise<CodeSuggestion[]>;
  
  // 代码审查
  async codeReview(code: string, language: string): Promise<ReviewComment[]>;
  
  // 性能优化建议
  async performanceOptimization(code: string): Promise<OptimizationSuggestion[]>;
  
  // 自动测试生成
  async generateTests(sourceCode: string): Promise<TestCode>;
  
  // 文档生成
  async generateDocumentation(code: string): Promise<Documentation>;
}

// 代码生成服务
class CodeGenerationService {
  // 生成代码
  async generateCode(templateId: string, parameters: TemplateParameterValue[]): Promise<GeneratedCode>;
  
  // 创建模板
  async createTemplate(templateData: CreateTemplateDto): Promise<CodeTemplate>;
  
  // 获取模板列表
  async getTemplates(filter?: TemplateFilter): Promise<CodeTemplate[]>;
  
  // 预览生成结果
  async previewGeneration(templateId: string, parameters: TemplateParameterValue[]): Promise<string>;
}
```

## 6. 数据库详细设计

### 6.1 数据库架构

#### 6.1.1 数据库分层设计

```plantuml
@startuml
package "数据库架构" {
  rectangle "读写分离" as rw_split {
    rectangle "主库 (Write)" as master_db
    rectangle "从库 (Read)" as slave_db1
    rectangle "从库 (Read)" as slave_db2
  }
  
  rectangle "分库分表" as sharding {
    rectangle "用户库" as user_db
    rectangle "项目库" as project_db
    rectangle "内容库" as content_db
  }
  
  rectangle "缓存层" as cache_layer {
    rectangle "Redis Cluster" as redis_cluster
    rectangle "本地缓存" as local_cache
  }
}
@enduml
```

#### 6.1.2 核心数据表设计

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('Client', 'ProjectManager', 'Developer', 'Admin')),
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    country VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'zh-CN',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 客户资料表
CREATE TABLE client_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    contact_person VARCHAR(255),
    department VARCHAR(255),
    position VARCHAR(255),
    business_requirements TEXT,
    preferred_contact_method VARCHAR(50) DEFAULT 'Email',
    project_budget_range VARCHAR(100),
    cooperation_history TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 公司信息表
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    company_type VARCHAR(50) NOT NULL CHECK (company_type IN ('OEM', 'Tier1', 'SystemIntegrator', 'Startup')),
    industry VARCHAR(100),
    scale VARCHAR(50) CHECK (scale IN ('Small', 'Medium', 'Large', 'Enterprise')),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    website VARCHAR(500),
    description TEXT,
    logo_url VARCHAR(500),
    business_license VARCHAR(100),
    tax_id VARCHAR(100),
    founded_year INTEGER,
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    cooperation_level VARCHAR(50) DEFAULT 'Potential' CHECK (cooperation_level IN ('Strategic', 'Regular', 'Potential')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 项目信息表
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    project_code VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES companies(id),
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('AppDevelopment', 'SystemIntegration', 'UIUXDesign', 'Testing', 'Consulting')),
    description TEXT,
    requirements TEXT,
    technology_stack JSONB,
    budget DECIMAL(15,2),
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status VARCHAR(50) DEFAULT 'Planning' CHECK (status IN ('Planning', 'Development', 'Testing', 'Delivered', 'Maintenance', 'Cancelled')),
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    project_manager_id UUID REFERENCES users(id),
    tech_lead_id UUID REFERENCES users(id),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 5),
    client_satisfaction DECIMAL(3,2) CHECK (client_satisfaction >= 0 AND client_satisfaction <= 5),
    tags JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 项目团队成员表
CREATE TABLE project_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(100) NOT NULL,
    responsibilities TEXT,
    allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id, role)
);

-- 项目里程碑表
CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    planned_date DATE NOT NULL,
    actual_date DATE,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'InProgress', 'Completed', 'Delayed', 'Cancelled')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    deliverables JSONB,
    dependencies JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务表
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES project_milestones(id),
    parent_task_id UUID REFERENCES tasks(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) DEFAULT 'Development' CHECK (task_type IN ('Development', 'Design', 'Testing', 'Documentation', 'Review', 'Meeting')),
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(50) DEFAULT 'Todo' CHECK (status IN ('Todo', 'InProgress', 'Review', 'Completed', 'Blocked', 'Cancelled')),
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    start_date DATE,
    due_date DATE,
    completion_date DATE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    tags JSONB,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 客户反馈表
CREATE TABLE client_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES companies(id),
    project_id UUID REFERENCES projects(id),
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('Requirement', 'Issue', 'Improvement', 'Satisfaction', 'Complaint')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'InProgress', 'Resolved', 'Closed')),
    category VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    resolution TEXT,
    resolved_at TIMESTAMP,
    client_rating DECIMAL(3,2) CHECK (client_rating >= 0 AND client_rating <= 5),
    internal_notes TEXT,
    attachments JSONB,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 技术支持工单表
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requester_id UUID NOT NULL REFERENCES users(id),
    client_id UUID REFERENCES companies(id),
    project_id UUID REFERENCES projects(id),
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Technical', 'Account', 'Billing', 'FeatureRequest', 'Bug', 'Question')),
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'InProgress', 'Resolved', 'Closed', 'Cancelled')),
    assigned_to UUID REFERENCES users(id),
    resolution TEXT,
    resolution_time_hours DECIMAL(8,2),
    satisfaction_rating DECIMAL(3,2) CHECK (satisfaction_rating >= 0 AND satisfaction_rating <= 5),
    attachments JSONB,
    tags JSONB,
    sla_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 知识库文章表
CREATE TABLE knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    keywords JSONB,
    author_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Review', 'Published', 'Archived')),
    visibility VARCHAR(50) DEFAULT 'Internal' CHECK (visibility IN ('Public', 'Client', 'Internal')),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    version VARCHAR(50) DEFAULT '1.0',
    attachments JSONB,
    related_articles JSONB,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 成功案例表
CREATE TABLE success_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_title VARCHAR(255) NOT NULL,
    description TEXT,
    client_name VARCHAR(255),
    client_id UUID REFERENCES companies(id),
    project_id UUID REFERENCES projects(id),
    case_type VARCHAR(50) NOT NULL CHECK (case_type IN ('NavigationApp', 'EntertainmentSystem', 'VoiceAssistant', 'VehicleControl', 'SystemIntegration')),
    industry VARCHAR(100),
    technology_stack JSONB,
    project_duration VARCHAR(100),
    team_size INTEGER,
    budget_range VARCHAR(100),
    challenges TEXT,
    solutions TEXT,
    achievements TEXT,
    key_metrics JSONB,
    screenshots JSONB,
    demo_url VARCHAR(500),
    video_url VARCHAR(500),
    client_testimonial TEXT,
    client_rating DECIMAL(3,2) CHECK (client_rating >= 0 AND client_rating <= 5),
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    tags JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 服务评价表
CREATE TABLE service_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES companies(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    overall_rating DECIMAL(3,2) NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 5),
    quality_rating DECIMAL(3,2) CHECK (quality_rating >= 0 AND quality_rating <= 5),
    timeline_rating DECIMAL(3,2) CHECK (timeline_rating >= 0 AND timeline_rating <= 5),
    communication_rating DECIMAL(3,2) CHECK (communication_rating >= 0 AND communication_rating <= 5),
    support_rating DECIMAL(3,2) CHECK (support_rating >= 0 AND support_rating <= 5),
    review_title VARCHAR(255),
    review_content TEXT,
    service_aspects JSONB,
    improvements_suggested TEXT,
    would_recommend BOOLEAN,
    is_public BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 代码模板表
CREATE TABLE code_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Component', 'Service', 'Model', 'Test', 'Config', 'Utility')),
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('Android', 'QNX', 'Linux', 'Web', 'Cross')),
    language VARCHAR(50) NOT NULL,
    framework VARCHAR(100),
    template_content TEXT NOT NULL,
    parameters JSONB,
    example_usage TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 索引设计

```sql
-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 项目表索引
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_pm ON projects(project_manager_id);
CREATE INDEX idx_projects_date_range ON projects(start_date, end_date);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- 任务表索引
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- 支持工单索引
CREATE INDEX idx_tickets_requester ON support_tickets(requester_id);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_tickets_category ON support_tickets(category);
CREATE INDEX idx_tickets_sla ON support_tickets(sla_deadline);

-- 成功案例索引
CREATE INDEX idx_cases_type ON success_cases(case_type);
CREATE INDEX idx_cases_featured ON success_cases(is_featured);
CREATE INDEX idx_cases_public ON success_cases(is_public);
CREATE INDEX idx_cases_client ON success_cases(client_id);

-- 全文搜索索引
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('english', project_name || ' ' || description));
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_articles_search ON knowledge_articles USING gin(to_tsvector('english', title || ' ' || content));
```

### 6.3 数据库优化策略

#### 6.3.1 分区表设计

```sql
-- 按时间分区的日志表
CREATE TABLE activity_logs (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE TABLE activity_logs_202501 PARTITION OF activity_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE activity_logs_202502 PARTITION OF activity_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

#### 6.3.2 缓存策略

```typescript
// Redis缓存策略
class CacheStrategy {
  // 用户信息缓存 (TTL: 30分钟)
  static readonly USER_CACHE_TTL = 30 * 60;
  static readonly USER_CACHE_KEY = 'user:';
  
  // 项目信息缓存 (TTL: 10分钟)
  static readonly PROJECT_CACHE_TTL = 10 * 60;
  static readonly PROJECT_CACHE_KEY = 'project:';
  
  // 成功案例缓存 (TTL: 2小时)
  static readonly CASE_CACHE_TTL = 2 * 60 * 60;
  static readonly CASE_CACHE_KEY = 'case:';
  
  // 热门搜索缓存 (TTL: 1小时)
  static readonly SEARCH_CACHE_TTL = 60 * 60;
  static readonly SEARCH_CACHE_KEY = 'search:';
}

// 缓存服务实现
class CacheService {
  constructor(private redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
  
  async exists(key: string): Promise<boolean> {
    return await this.redis.exists(key) === 1;
  }
}
```

## 7. API接口设计

### 7.1 RESTful API规范

#### 7.1.1 API设计原则
- 遵循RESTful设计原则
- 使用HTTP状态码表示操作结果
- 统一的响应格式
- 版本控制支持
- 请求/响应数据验证

#### 7.1.2 API基础规范

```typescript
// 统一响应格式
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ErrorInfo;
  pagination?: PaginationInfo;
  timestamp: string;
  requestId: string;
}

interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// HTTP状态码规范
enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
}
```

### 7.2 核心API设计

#### 7.2.1 认证授权API

```typescript
// 认证相关接口
@Controller('/api/v1/auth')
export class AuthController {
  
  @Post('/login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    // 实现登录逻辑
  }
  
  @Post('/logout')
  @ApiOperation({ summary: '用户登出' })
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: Request): Promise<ApiResponse<void>> {
    // 实现登出逻辑
  }
  
  @Post('/refresh')
  @ApiOperation({ summary: '刷新访问令牌' })
  async refreshToken(@Body() refreshDto: RefreshTokenDto): Promise<ApiResponse<TokenResponse>> {
    // 实现令牌刷新逻辑
  }
  
  @Post('/forgot-password')
  @ApiOperation({ summary: '忘记密码' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ApiResponse<void>> {
    // 实现忘记密码逻辑
  }
}

// 登录DTO
export class LoginDto {
  @ApiProperty({ description: '用户名或邮箱' })
  @IsNotEmpty()
  @IsString()
  username: string;
  
  @ApiProperty({ description: '密码' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
  
  @ApiProperty({ description: '记住我', required: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

// 登录响应
export interface LoginResponse {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

#### 7.2.2 客户管理API

```typescript
@Controller('/api/v1/clients')
@UseGuards(JwtAuthGuard)
export class ClientController {
  
  @Get()
  @ApiOperation({ summary: '获取客户列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ClientType })
  async getClients(@Query() query: GetClientsDto): Promise<ApiResponse<Client[]>> {
    // 实现获取客户列表逻辑
  }
  
  @Get(':id')
  @ApiOperation({ summary: '获取客户详情' })
  @ApiParam({ name: 'id', description: '客户ID' })
  async getClientDetail(@Param('id') id: string): Promise<ApiResponse<Client>> {
    // 实现获取客户详情逻辑
  }
  
  @Post()
  @ApiOperation({ summary: '创建客户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createClient(@Body() createClientDto: CreateClientDto): Promise<ApiResponse<Client>> {
    // 实现创建客户逻辑
  }
  
  @Put(':id')
  @ApiOperation({ summary: '更新客户信息' })
  async updateClient(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto
  ): Promise<ApiResponse<Client>> {
    // 实现更新客户逻辑
  }
  
  @Delete(':id')
  @ApiOperation({ summary: '删除客户' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async deleteClient(@Param('id') id: string): Promise<ApiResponse<void>> {
    // 实现删除客户逻辑
  }
  
  @Get(':id/projects')
  @ApiOperation({ summary: '获取客户项目列表' })
  async getClientProjects(@Param('id') id: string): Promise<ApiResponse<Project[]>> {
    // 实现获取客户项目逻辑
  }
}

// 创建客户DTO
export class CreateClientDto {
  @ApiProperty({ description: '公司名称' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  companyName: string;
  
  @ApiProperty({ description: '客户类型', enum: ClientType })
  @IsEnum(ClientType)
  clientType: ClientType;
  
  @ApiProperty({ description: '行业', required: false })
  @IsOptional()
  @IsString()
  industry?: string;
  
  @ApiProperty({ description: '公司规模', enum: CompanyScale, required: false })
  @IsOptional()
  @IsEnum(CompanyScale)
  scale?: CompanyScale;
  
  @ApiProperty({ description: '国家' })
  @IsNotEmpty()
  @IsString()
  country: string;
  
  @ApiProperty({ description: '网站', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;
  
  @ApiProperty({ description: '公司描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
```

#### 7.2.3 项目管理API

```typescript
@Controller('/api/v1/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  
  @Get()
  @ApiOperation({ summary: '获取项目列表' })
  async getProjects(@Query() query: GetProjectsDto): Promise<ApiResponse<Project[]>> {
    // 实现获取项目列表逻辑
  }
  
  @Get(':id')
  @ApiOperation({ summary: '获取项目详情' })
  async getProjectDetail(@Param('id') id: string): Promise<ApiResponse<ProjectDetail>> {
    // 实现获取项目详情逻辑
  }
  
  @Post()
  @ApiOperation({ summary: '创建项目' })
  async createProject(@Body() createProjectDto: CreateProjectDto): Promise<ApiResponse<Project>> {
    // 实现创建项目逻辑
  }
  
  @Put(':id/status')
  @ApiOperation({ summary: '更新项目状态' })
  async updateProjectStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateProjectStatusDto
  ): Promise<ApiResponse<void>> {
    // 实现更新项目状态逻辑
  }
  
  @Get(':id/tasks')
  @ApiOperation({ summary: '获取项目任务列表' })
  async getProjectTasks(@Param('id') id: string): Promise<ApiResponse<Task[]>> {
    // 实现获取项目任务逻辑
  }
  
  @Post(':id/tasks')
  @ApiOperation({ summary: '创建项目任务' })
  async createTask(
    @Param('id') projectId: string,
    @Body() createTaskDto: CreateTaskDto
  ): Promise<ApiResponse<Task>> {
    // 实现创建任务逻辑
  }
  
  @Get(':id/milestones')
  @ApiOperation({ summary: '获取项目里程碑' })
  async getProjectMilestones(@Param('id') id: string): Promise<ApiResponse<Milestone[]>> {
    // 实现获取里程碑逻辑
  }
  
  @Post(':id/documents')
  @ApiOperation({ summary: '上传项目文档' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('id') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: DocumentMetadataDto
  ): Promise<ApiResponse<Document>> {
    // 实现文档上传逻辑
  }
}
```

#### 7.2.4 技术支持API

```typescript
@Controller('/api/v1/support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  
  @Get('/tickets')
  @ApiOperation({ summary: '获取工单列表' })
  async getTickets(@Query() query: GetTicketsDto): Promise<ApiResponse<SupportTicket[]>> {
    // 实现获取工单列表逻辑
  }
  
  @Get('/tickets/:id')
  @ApiOperation({ summary: '获取工单详情' })
  async getTicketDetail(@Param('id') id: string): Promise<ApiResponse<SupportTicketDetail>> {
    // 实现获取工单详情逻辑
  }
  
  @Post('/tickets')
  @ApiOperation({ summary: '创建工单' })
  async createTicket(@Body() createTicketDto: CreateTicketDto): Promise<ApiResponse<SupportTicket>> {
    // 实现创建工单逻辑
  }
  
  @Put('/tickets/:id/assign')
  @ApiOperation({ summary: '分配工单' })
  async assignTicket(
    @Param('id') id: string,
    @Body() assignDto: AssignTicketDto
  ): Promise<ApiResponse<void>> {
    // 实现分配工单逻辑
  }
  
  @Post('/tickets/:id/comments')
  @ApiOperation({ summary: '添加工单评论' })
  async addComment(
    @Param('id') ticketId: string,
    @Body() commentDto: CreateCommentDto
  ): Promise<ApiResponse<TicketComment>> {
    // 实现添加评论逻辑
  }
  
  @Get('/knowledge')
  @ApiOperation({ summary: '获取知识库文章' })
  async getKnowledgeArticles(@Query() query: GetArticlesDto): Promise<ApiResponse<KnowledgeArticle[]>> {
    // 实现获取知识库文章逻辑
  }
  
  @Get('/knowledge/:id')
  @ApiOperation({ summary: '获取知识库文章详情' })
  async getArticleDetail(@Param('id') id: string): Promise<ApiResponse<KnowledgeArticle>> {
    // 实现获取文章详情逻辑
  }
}
```

#### 7.2.5 开发工具API

```typescript
@Controller('/api/v1/dev-tools')
@UseGuards(JwtAuthGuard)
export class DevToolsController {
  
  @Get('/templates')
  @ApiOperation({ summary: '获取代码模板列表' })
  async getTemplates(@Query() query: GetTemplatesDto): Promise<ApiResponse<CodeTemplate[]>> {
    // 实现获取模板列表逻辑
  }
  
  @Get('/templates/:id')
  @ApiOperation({ summary: '获取代码模板详情' })
  async getTemplateDetail(@Param('id') id: string): Promise<ApiResponse<CodeTemplate>> {
    // 实现获取模板详情逻辑
  }
  
  @Post('/templates/:id/generate')
  @ApiOperation({ summary: '生成代码' })
  async generateCode(
    @Param('id') templateId: string,
    @Body() generateDto: GenerateCodeDto
  ): Promise<ApiResponse<GeneratedCode>> {
    // 实现代码生成逻辑
  }
  
  @Post('/ai/completion')
  @ApiOperation({ summary: 'AI代码补全' })
  async codeCompletion(@Body() completionDto: CodeCompletionDto): Promise<ApiResponse<CodeSuggestion[]>> {
    // 实现AI代码补全逻辑
  }
  
  @Post('/ai/review')
  @ApiOperation({ summary: 'AI代码审查' })
  async codeReview(@Body() reviewDto: CodeReviewDto): Promise<ApiResponse<ReviewComment[]>> {
    // 实现AI代码审查逻辑
  }
  
  @Post('/ai/optimize')
  @ApiOperation({ summary: 'AI性能优化建议' })
  async optimizationSuggestion(@Body() optimizeDto: OptimizeCodeDto): Promise<ApiResponse<OptimizationSuggestion[]>> {
    // 实现性能优化建议逻辑
  }
}
```

### 7.3 WebSocket实时通信API

```typescript
// WebSocket网关
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/collaboration'
})
export class CollaborationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;
  
  private logger: Logger = new Logger('CollaborationGateway');
  
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
  
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  
  @SubscribeMessage('join-project')
  async handleJoinProject(
    @MessageBody() data: JoinProjectDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    // 加入项目房间
    await client.join(`project-${data.projectId}`);
    
    // 通知其他用户
    client.to(`project-${data.projectId}`).emit('user-joined', {
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date()
    });
  }
  
  @SubscribeMessage('leave-project')
  async handleLeaveProject(
    @MessageBody() data: LeaveProjectDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    // 离开项目房间
    await client.leave(`project-${data.projectId}`);
    
    // 通知其他用户
    client.to(`project-${data.projectId}`).emit('user-left', {
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date()
    });
  }
  
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    // 保存消息到数据库
    const message = await this.saveMessage(data);
    
    // 广播消息到项目房间
    this.server.to(`project-${data.projectId}`).emit('new-message', message);
  }
  
  @SubscribeMessage('task-update')
  async handleTaskUpdate(
    @MessageBody() data: TaskUpdateDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    // 更新任务状态
    await this.updateTaskStatus(data);
    
    // 通知项目成员
    this.server.to(`project-${data.projectId}`).emit('task-updated', {
      taskId: data.taskId,
      status: data.status,
      updatedBy: data.updatedBy,
      timestamp: new Date()
    });
  }
  
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    // 广播正在输入状态
    client.to(`project-${data.projectId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName
    });
  }
}

// WebSocket DTO
export class JoinProjectDto {
  @IsUUID()
  projectId: string;
  
  @IsUUID()
  userId: string;
  
  @IsString()
  userName: string;
}

export class SendMessageDto {
  @IsUUID()
  projectId: string;
  
  @IsUUID()
  senderId: string;
  
  @IsString()
  @IsNotEmpty()
  content: string;
  
  @IsEnum(['text', 'file', 'image'])
  type: 'text' | 'file' | 'image';
  
  @IsOptional()
  @IsObject()
  metadata?: any;
}
```

## 8. 安全设计

### 8.1 认证授权设计

#### 8.1.1 JWT认证机制

```typescript
// JWT策略
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }
  
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }
    return user;
  }
}

// JWT守卫
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('认证失败');
    }
    return user;
  }
}

// 角色守卫
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// 权限装饰器
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// 使用示例
@Controller('/api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.ProjectManager)
export class AdminController {
  // 只有管理员和项目经理可以访问
}
```

#### 8.1.2 权限控制设计

```typescript
// 权限枚举
export enum Permission {
  // 客户管理权限
  CLIENT_CREATE = 'client:create',
  CLIENT_READ = 'client:read',
  CLIENT_UPDATE = 'client:update',
  CLIENT_DELETE = 'client:delete',
  
  // 项目管理权限
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_ASSIGN = 'project:assign',
  
  // 任务管理权限
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',
  
  // 支持工单权限
  TICKET_CREATE = 'ticket:create',
  TICKET_READ = 'ticket:read',
  TICKET_UPDATE = 'ticket:update',
  TICKET_ASSIGN = 'ticket:assign',
  
  // 系统管理权限
  SYSTEM_CONFIG = 'system:config',
  USER_MANAGE = 'user:manage',
  ROLE_MANAGE = 'role:manage'
}

// RBAC权限检查装饰器
export const RequirePermissions = (...permissions: Permission[]) => {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(JwtAuthGuard, PermissionsGuard)
  );
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<Permission[]>('permissions', context.getHandler());
    
    if (!requiredPermissions) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    const userPermissions = await this.roleService.getUserPermissions(user.id);
    
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }
}

// 使用示例
@Controller('/api/v1/projects')
export class ProjectController {
  
  @Post()
  @RequirePermissions(Permission.PROJECT_CREATE)
  async createProject(@Body() createProjectDto: CreateProjectDto) {
    // 只有具有项目创建权限的用户才能访问
  }
  
  @Put(':id')
  @RequirePermissions(Permission.PROJECT_UPDATE)
  async updateProject(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    // 只有具有项目更新权限的用户才能访问
  }
}
```

### 8.2 数据安全设计

#### 8.2.1 数据加密

```typescript
// 敏感数据加密服务
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;
  
  constructor(private configService: ConfigService) {
    this.secretKey = Buffer.from(configService.get<string>('ENCRYPTION_KEY'), 'hex');
  }
  
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from('additional_data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setAAD(Buffer.from('additional_data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// 敏感字段加密装饰器
export function Encrypted(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    // 实现字段加密逻辑
  };
}

// 使用示例
@Entity()
export class ClientProfile {
  @Column()
  @Encrypted()
  contactPerson: string;
  
  @Column()
  @Encrypted()
  phone: string;
  
  @Column()
  @Encrypted()
  businessRequirements: string;
}
```

#### 8.2.2 数据脱敏

```typescript
// 数据脱敏服务
@Injectable()
export class DataMaskingService {
  
  // 手机号脱敏
  maskPhone(phone: string): string {
    if (!phone || phone.length < 7) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  
  // 邮箱脱敏
  maskEmail(email: string): string {
    if (!email) return email;
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.slice(0, 2)}***@${domain}`;
  }
  
  // 身份证脱敏
  maskIdCard(idCard: string): string {
    if (!idCard || idCard.length < 8) return idCard;
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  }
  
  // 银行卡脱敏
  maskBankCard(bankCard: string): string {
    if (!bankCard || bankCard.length < 8) return bankCard;
    return bankCard.replace(/(\d{4})\d+(\d{4})/, '$1****$2');
  }
  
  // 通用脱敏
  maskData(data: any, fields: string[]): any {
    const masked = { ...data };
    
    fields.forEach(field => {
      if (masked[field]) {
        if (field.includes('phone')) {
          masked[field] = this.maskPhone(masked[field]);
        } else if (field.includes('email')) {
          masked[field] = this.maskEmail(masked[field]);
        } else if (field.includes('id')) {
          masked[field] = this.maskIdCard(masked[field]);
        } else {
          // 默认脱敏策略
          const value = masked[field].toString();
          if (value.length > 4) {
            masked[field] = value.slice(0, 2) + '****' + value.slice(-2);
          }
        }
      }
    });
    
    return masked;
  }
}

// 响应数据脱敏拦截器
@Injectable()
export class DataMaskingInterceptor implements NestInterceptor {
  constructor(private dataMaskingService: DataMaskingService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return next.handle().pipe(
      map(data => {
        // 根据用户角色决定是否脱敏
        if (this.shouldMaskData(user, context)) {
          return this.maskSensitiveData(data);
        }
        return data;
      })
    );
  }
  
  private shouldMaskData(user: any, context: ExecutionContext): boolean {
    // 实现脱敏规则逻辑
    const handler = context.getHandler();
    const maskingRules = Reflect.getMetadata('masking', handler);
    
    if (!maskingRules) return false;
    
    return !user.roles.includes('admin');
  }
  
  private maskSensitiveData(data: any): any {
    const sensitiveFields = ['phone', 'email', 'idCard', 'bankCard'];
    return this.dataMaskingService.maskData(data, sensitiveFields);
  }
}
```

### 8.3 API安全设计

#### 8.3.1 限流防护

```typescript
// 限流配置
export interface RateLimitConfig {
  windowMs: number;  // 时间窗口(毫秒)
  max: number;       // 最大请求数
  message?: string;  // 限流提示消息
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// 限流装饰器
export const RateLimit = (config: RateLimitConfig) => {
  return applyDecorators(
    SetMetadata('rateLimit', config),
    UseGuards(RateLimitGuard)
  );
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private redis: Redis,
    private reflector: Reflector
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<RateLimitConfig>('rateLimit', context.getHandler());
    
    if (!config) return true;
    
    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(request, context);
    
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, Math.ceil(config.windowMs / 1000));
    }
    
    if (current > config.max) {
      throw new HttpException(
        config.message || '请求过于频繁，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    
    return true;
  }
  
  private generateKey(request: Request, context: ExecutionContext): string {
    const route = context.getHandler().name;
    const ip = request.ip;
    const userId = request.user?.id || 'anonymous';
    
    return `rate_limit:${route}:${ip}:${userId}`;
  }
}

// 使用示例
@Controller('/api/v1/auth')
export class AuthController {
  
  @Post('/login')
  @RateLimit({ windowMs: 15 * 60 * 1000, max: 5 }) // 15分钟内最多5次登录尝试
  async login(@Body() loginDto: LoginDto) {
    // 登录逻辑
  }
  
  @Post('/forgot-password')
  @RateLimit({ windowMs: 60 * 60 * 1000, max: 3 }) // 1小时内最多3次忘记密码请求
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    // 忘记密码逻辑
  }
}
```

#### 8.3.2 输入验证和XSS防护

```typescript
// 自定义验证装饰器
export function IsNotXSS(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotXSS',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return true;
          
          // 检测XSS攻击模式
          const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*>/gi,
            /<link\b[^<]*>/gi,
            /<meta\b[^<]*>/gi
          ];
          
          return !xssPatterns.some(pattern => pattern.test(value));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} contains potentially dangerous content`;
        }
      }
    });
  };
}

// XSS过滤服务
@Injectable()
export class XSSFilterService {
  private readonly dompurify = createDOMPurify(new JSDOM('').window);
  
  sanitize(input: string): string {
    return this.dompurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }
  
  sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitize(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  }
}

// 全局验证管道
@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private xssFilter: XSSFilterService) {}
  
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      // 对请求体进行XSS过滤
      return this.xssFilter.sanitizeObject(value);
    }
    return value;
  }
}
```

### 8.4 安全监控

#### 8.4.1 安全事件监控

```typescript
// 安全事件类型
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  PERMISSION_DENIED = 'permission_denied',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_ACCESS = 'data_access',
  API_ABUSE = 'api_abuse',
  INJECTION_ATTEMPT = 'injection_attempt'
}

// 安全事件实体
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId?: string;
  ip: string;
  userAgent: string;
  endpoint: string;
  payload?: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 安全监控服务
@Injectable()
export class SecurityMonitoringService {
  constructor(
    private logger: Logger,
    private alertService: AlertService,
    private redis: Redis
  ) {}
  
  async logSecurityEvent(event: Partial<SecurityEvent>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: uuidv4(),
      ip: event.ip || 'unknown',
      userAgent: event.userAgent || 'unknown',
      endpoint: event.endpoint || 'unknown',
      riskLevel: event.riskLevel || 'low',
      timestamp: new Date(),
      ...event
    };
    
    // 记录到日志
    this.logger.warn(`Security Event: ${securityEvent.type}`, securityEvent);
    
    // 存储到Redis用于实时分析
    await this.redis.lpush('security_events', JSON.stringify(securityEvent));
    await this.redis.expire('security_events', 86400); // 24小时过期
    
    // 高风险事件立即告警
    if (securityEvent.riskLevel === 'high' || securityEvent.riskLevel === 'critical') {
      await this.alertService.sendSecurityAlert(securityEvent);
    }
    
    // 检查是否需要触发自动响应
    await this.checkForAutomaticResponse(securityEvent);
  }
  
  private async checkForAutomaticResponse(event: SecurityEvent): Promise<void> {
    // 检查登录失败次数
    if (event.type === SecurityEventType.LOGIN_FAILURE) {
      const key = `login_failures:${event.ip}`;
      const failures = await this.redis.incr(key);
      await this.redis.expire(key, 300); // 5分钟窗口
      
      if (failures >= 5) {
        // 自动封禁IP
        await this.blockIP(event.ip, 1800); // 封禁30分钟
        await this.alertService.sendAlert('IP自动封禁', `IP ${event.ip} 因连续登录失败被自动封禁`);
      }
    }
    
    // 检查API滥用
    if (event.type === SecurityEventType.API_ABUSE) {
      const key = `api_abuse:${event.userId || event.ip}`;
      const count = await this.redis.incr(key);
      await this.redis.expire(key, 3600); // 1小时窗口
      
      if (count >= 100) {
        // 限制用户或IP
        await this.limitUser(event.userId || event.ip, 3600);
      }
    }
  }
  
  private async blockIP(ip: string, duration: number): Promise<void> {
    await this.redis.setex(`blocked_ip:${ip}`, duration, '1');
  }
  
  private async limitUser(identifier: string, duration: number): Promise<void> {
    await this.redis.setex(`limited_user:${identifier}`, duration, '1');
  }
}

// 安全监控拦截器
@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  constructor(private securityMonitoring: SecurityMonitoringService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          // 记录成功访问
          this.logAccessEvent(request, 'success', Date.now() - startTime);
        },
        error: (error) => {
          // 记录错误访问
          this.logAccessEvent(request, 'error', Date.now() - startTime, error);
        }
      })
    );
  }
  
  private async logAccessEvent(
    request: any, 
    result: 'success' | 'error', 
    duration: number, 
    error?: any
  ): Promise<void> {
    const riskLevel = this.assessRiskLevel(request, result, error);
    
    if (riskLevel !== 'low') {
      await this.securityMonitoring.logSecurityEvent({
        type: result === 'error' ? SecurityEventType.SUSPICIOUS_ACTIVITY : SecurityEventType.DATA_ACCESS,
        userId: request.user?.id,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        endpoint: `${request.method} ${request.url}`,
        riskLevel,
        metadata: {
          duration,
          statusCode: error?.status,
          errorMessage: error?.message
        }
      });
    }
  }
  
  private assessRiskLevel(request: any, result: string, error?: any): 'low' | 'medium' | 'high' | 'critical' {
    // SQL注入尝试检测
    const sqlInjectionPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i,
      /'/g
    ];
    
    const requestString = JSON.stringify(request.body || '') + request.url;
    if (sqlInjectionPatterns.some(pattern => pattern.test(requestString))) {
      return 'critical';
    }
    
    // 频繁错误请求
    if (result === 'error' && error?.status >= 400) {
      return 'medium';
    }
    
    // 敏感端点访问
    const sensitiveEndpoints = ['/admin', '/config', '/users', '/system'];
    if (sensitiveEndpoints.some(endpoint => request.url.includes(endpoint))) {
      return 'medium';
    }
    
    return 'low';
  }
}
```

## 9. 性能设计

### 9.1 缓存策略设计

#### 9.1.1 多层缓存架构

```typescript
// 缓存层级定义
export enum CacheLevel {
  L1_MEMORY = 'L1_MEMORY',     // 应用内存缓存
  L2_REDIS = 'L2_REDIS',       // Redis分布式缓存
  L3_CDN = 'L3_CDN'            // CDN边缘缓存
}

// 缓存配置
export interface CacheConfig {
  level: CacheLevel[];
  ttl: number;
  maxSize?: number;
  refreshAhead?: boolean;
  compression?: boolean;
}

// 多层缓存服务
@Injectable()
export class MultiLevelCacheService {
  private memoryCache = new LRUCache<string, any>({ max: 1000 });
  
  constructor(
    private redis: Redis,
    private cdnService: CDNService
  ) {}
  
  async get<T>(key: string, config: CacheConfig): Promise<T | null> {
    // L1: 内存缓存
    if (config.level.includes(CacheLevel.L1_MEMORY)) {
      const memoryResult = this.memoryCache.get(key);
      if (memoryResult) {
        return memoryResult;
      }
    }
    
    // L2: Redis缓存
    if (config.level.includes(CacheLevel.L2_REDIS)) {
      const redisResult = await this.redis.get(key);
      if (redisResult) {
        const parsed = JSON.parse(redisResult);
        
        // 回填L1缓存
        if (config.level.includes(CacheLevel.L1_MEMORY)) {
          this.memoryCache.set(key, parsed, { ttl: config.ttl });
        }
        
        return parsed;
      }
    }
    
    // L3: CDN缓存（通常用于静态资源）
    if (config.level.includes(CacheLevel.L3_CDN)) {
      return await this.cdnService.get(key);
    }
    
    return null;
  }
  
  async set<T>(key: string, value: T, config: CacheConfig): Promise<void> {
    const serialized = JSON.stringify(value);
    
    // 设置L1缓存
    if (config.level.includes(CacheLevel.L1_MEMORY)) {
      this.memoryCache.set(key, value, { ttl: config.ttl });
    }
    
    // 设置L2缓存
    if (config.level.includes(CacheLevel.L2_REDIS)) {
      if (config.compression && serialized.length > 1024) {
        const compressed = await this.compress(serialized);
        await this.redis.setex(`${key}:compressed`, config.ttl, compressed);
      } else {
        await this.redis.setex(key, config.ttl, serialized);
      }
    }
    
    // 设置L3缓存
    if (config.level.includes(CacheLevel.L3_CDN)) {
      await this.cdnService.set(key, value, config.ttl);
    }
  }
  
  async invalidate(key: string, config: CacheConfig): Promise<void> {
    // 清除所有层级的缓存
    if (config.level.includes(CacheLevel.L1_MEMORY)) {
      this.memoryCache.delete(key);
    }
    
    if (config.level.includes(CacheLevel.L2_REDIS)) {
      await this.redis.del(key);
      await this.redis.del(`${key}:compressed`);
    }
    
    if (config.level.includes(CacheLevel.L3_CDN)) {
      await this.cdnService.invalidate(key);
    }
  }
  
  private async compress(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (err, result) => {
        if (err) reject(err);
        else resolve(result.toString('base64'));
      });
    });
  }
}

// 缓存装饰器
export function Cacheable(config: CacheConfig) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      const cacheService = this.cacheService as MultiLevelCacheService;
      
      // 尝试从缓存获取
      const cached = await cacheService.get(cacheKey, config);
      if (cached !== null) {
        return cached;
      }
      
      // 执行原方法
      const result = await method.apply(this, args);
      
      // 存入缓存
      await cacheService.set(cacheKey, result, config);
      
      return result;
    };
  };
}

// 使用示例
@Injectable()
export class ProjectService {
  constructor(private cacheService: MultiLevelCacheService) {}
  
  @Cacheable({
    level: [CacheLevel.L1_MEMORY, CacheLevel.L2_REDIS],
    ttl: 300, // 5分钟
    refreshAhead: true
  })
  async getProject(id: string): Promise<Project> {
    // 实际的数据库查询逻辑
    return await this.projectRepository.findById(id);
  }
  
  @Cacheable({
    level: [CacheLevel.L2_REDIS],
    ttl: 3600, // 1小时
    compression: true
  })
  async getProjectStatistics(): Promise<ProjectStatistics> {
    // 复杂的统计查询
    return await this.calculateStatistics();
  }
}
```

### 9.2 数据库性能优化

#### 9.2.1 读写分离与连接池

```typescript
// 数据库配置
export interface DatabaseConfig {
  master: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    maxConnections: number;
    idleTimeout: number;
  };
  slaves: Array<{
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    maxConnections: number;
    weight: number; // 负载权重
  }>;
}

// 数据库连接管理器
@Injectable()
export class DatabaseConnectionManager {
  private masterConnection: DataSource;
  private slaveConnections: DataSource[] = [];
  private slaveWeights: number[] = [];
  
  constructor(private config: DatabaseConfig) {
    this.initializeConnections();
  }
  
  private async initializeConnections(): Promise<void> {
    // 初始化主库连接
    this.masterConnection = new DataSource({
      type: 'postgres',
      ...this.config.master,
      poolSize: this.config.master.maxConnections,
      extra: {
        idleTimeoutMillis: this.config.master.idleTimeout,
        connectionTimeoutMillis: 5000,
        maxLifetime: 3600000 // 1小时
      }
    });
    
    await this.masterConnection.initialize();
    
    // 初始化从库连接
    for (const slaveConfig of this.config.slaves) {
      const slaveConnection = new DataSource({
        type: 'postgres',
        ...slaveConfig,
        poolSize: slaveConfig.maxConnections,
        extra: {
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          maxLifetime: 3600000
        }
      });
      
      await slaveConnection.initialize();
      this.slaveConnections.push(slaveConnection);
      this.slaveWeights.push(slaveConfig.weight);
    }
  }
  
  // 获取写连接（主库）
  getWriteConnection(): DataSource {
    return this.masterConnection;
  }
  
  // 获取读连接（从库，基于权重负载均衡）
  getReadConnection(): DataSource {
    if (this.slaveConnections.length === 0) {
      return this.masterConnection;
    }
    
    const totalWeight = this.slaveWeights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < this.slaveWeights.length; i++) {
      random -= this.slaveWeights[i];
      if (random <= 0) {
        return this.slaveConnections[i];
      }
    }
    
    return this.slaveConnections[0];
  }
  
  // 健康检查
  async healthCheck(): Promise<{ master: boolean; slaves: boolean[] }> {
    const results = {
      master: false,
      slaves: [] as boolean[]
    };
    
    try {
      await this.masterConnection.query('SELECT 1');
      results.master = true;
    } catch (error) {
      console.error('Master database health check failed:', error);
    }
    
    for (const slave of this.slaveConnections) {
      try {
        await slave.query('SELECT 1');
        results.slaves.push(true);
      } catch (error) {
        console.error('Slave database health check failed:', error);
        results.slaves.push(false);
      }
    }
    
    return results;
  }
}

// 读写分离装饰器
export function ReadOnly() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const connectionManager = this.connectionManager as DatabaseConnectionManager;
      const connection = connectionManager.getReadConnection();
      
      // 在读连接上执行方法
      return await method.apply(this, [connection, ...args]);
    };
  };
}

export function WriteOnly() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const connectionManager = this.connectionManager as DatabaseConnectionManager;
      const connection = connectionManager.getWriteConnection();
      
      // 在写连接上执行方法
      return await method.apply(this, [connection, ...args]);
    };
  };
}

// 使用示例
@Injectable()
export class ProjectRepository {
  constructor(private connectionManager: DatabaseConnectionManager) {}
  
  @ReadOnly()
  async findById(connection: DataSource, id: string): Promise<Project> {
    return await connection.getRepository(Project).findOne({ where: { id } });
  }
  
  @ReadOnly()
  async findByClientId(connection: DataSource, clientId: string): Promise<Project[]> {
    return await connection.getRepository(Project).find({ where: { clientId } });
  }
  
  @WriteOnly()
  async create(connection: DataSource, projectData: CreateProjectDto): Promise<Project> {
    const project = connection.getRepository(Project).create(projectData);
    return await connection.getRepository(Project).save(project);
  }
  
  @WriteOnly()
  async update(connection: DataSource, id: string, updateData: UpdateProjectDto): Promise<void> {
    await connection.getRepository(Project).update(id, updateData);
  }
}
```

### 9.3 前端性能优化

#### 9.3.1 代码分割与懒加载

```typescript
// 路由懒加载配置
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// 懒加载组件
const ServiceDisplay = lazy(() => import('./pages/ServiceDisplay'));
const ClientManagement = lazy(() => import('./pages/ClientManagement'));
const ProjectCollaboration = lazy(() => import('./pages/ProjectCollaboration'));
const TechnicalSupport = lazy(() => import('./pages/TechnicalSupport'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// 路由配置
export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/services" element={<ServiceDisplay />} />
        <Route path="/clients/*" element={<ClientManagement />} />
        <Route path="/projects/*" element={<ProjectCollaboration />} />
        <Route path="/support/*" element={<TechnicalSupport />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
};

// Webpack代码分割配置
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        },
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          name: 'antd',
          chunks: 'all',
          priority: 15
        }
      }
    }
  }
};
```

#### 9.3.2 虚拟滚动和数据分页

```typescript
// 虚拟滚动组件
import { FixedSizeList as List } from 'react-window';
import { memo, useCallback, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onItemClick?: (item: T, index: number) => void;
}

export const VirtualList = memo(<T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  onItemClick
}: VirtualListProps<T>) => {
  const ItemRenderer = useCallback(({ index, style }) => {
    const item = items[index];
    
    return (
      <div
        style={style}
        onClick={() => onItemClick?.(item, index)}
        className="virtual-list-item"
      >
        {renderItem(item, index)}
      </div>
    );
  }, [items, renderItem, onItemClick]);
  
  return (
    <List
      height={containerHeight}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
    >
      {ItemRenderer}
    </List>
  );
});

// 无限滚动Hook
export const useInfiniteScroll = <T>(
  fetchData: (page: number, pageSize: number) => Promise<{ data: T[]; total: number; hasNext: boolean }>,
  pageSize: number = 20
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [page, setPage] = useState(1);
  
  const loadMore = useCallback(async () => {
    if (loading || !hasNext) return;
    
    setLoading(true);
    try {
      const result = await fetchData(page, pageSize);
      setData(prev => [...prev, ...result.data]);
      setHasNext(result.hasNext);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, pageSize, loading, hasNext]);
  
  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasNext(true);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    loadMore();
  }, []);
  
  return {
    data,
    loading,
    hasNext,
    loadMore,
    reset
  };
};

// 使用示例
export const ProjectList: React.FC = () => {
  const { data: projects, loading, hasNext, loadMore } = useInfiniteScroll(
    async (page, pageSize) => {
      const response = await projectApi.getProjects({ page, limit: pageSize });
      return {
        data: response.data,
        total: response.pagination.total,
        hasNext: response.pagination.hasNext
      };
    },
    20
  );
  
  return (
    <InfiniteScroll
      dataLength={projects.length}
      next={loadMore}
      hasMore={hasNext}
      loader={<Spin />}
      endMessage={<p>没有更多数据了</p>}
    >
      <VirtualList
        items={projects}
        itemHeight={100}
        containerHeight={600}
        renderItem={(project, index) => (
          <ProjectCard key={project.id} project={project} />
        )}
      />
    </InfiniteScroll>
  );
};
```

## 10. 部署方案

### 10.1 容器化部署

#### 10.1.1 Docker配置

```dockerfile
# 前端Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# 后端Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

#### 10.1.2 Kubernetes部署配置

```yaml
# 命名空间
apiVersion: v1
kind: Namespace
metadata:
  name: vehicle-app-dev

---
# 配置映射
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: vehicle-app-dev
data:
  DATABASE_HOST: "postgres-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "vehicle_app"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  NODE_ENV: "production"

---
# 密钥
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: vehicle-app-dev
type: Opaque
stringData:
  DATABASE_USERNAME: "vehicle_user"
  DATABASE_PASSWORD: "secure_password"
  JWT_SECRET: "your-jwt-secret"
  ENCRYPTION_KEY: "your-encryption-key"

---
# 后端部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: vehicle-app-dev
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: vehicle-app/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_HOST
        - name: DATABASE_USERNAME
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_USERNAME
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_PASSWORD
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          limits:
            cpu: 1000m
            memory: 1Gi
          requests:
            cpu: 500m
            memory: 512Mi

---
# 前端部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: vehicle-app-dev
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: vehicle-app/frontend:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 200m
            memory: 256Mi

---
# 服务定义
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: vehicle-app-dev
spec:
  selector:
    app: backend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: vehicle-app-dev
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP

---
# Ingress配置
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: vehicle-app-dev
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.vehicle-app.com
    - www.vehicle-app.com
    secretName: app-tls
  rules:
  - host: api.vehicle-app.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3000
  - host: www.vehicle-app.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80

---
# 水平伸缩配置
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: vehicle-app-dev
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 10.2 CI/CD流水线

#### 10.2.1 GitLab CI配置

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - security
  - deploy-dev
  - deploy-staging
  - deploy-prod

variables:
  DOCKER_REGISTRY: registry.gitlab.com/vehicle-app
  DOCKER_DRIVER: overlay2
  KUBERNETES_NAMESPACE_DEV: vehicle-app-dev
  KUBERNETES_NAMESPACE_STAGING: vehicle-app-staging
  KUBERNETES_NAMESPACE_PROD: vehicle-app-prod

# 测试阶段
test:frontend:
  stage: test
  image: node:18-alpine
  script:
    - cd frontend
    - npm ci
    - npm run lint
    - npm run test:coverage
    - npm run type-check
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: frontend/coverage/cobertura-coverage.xml
  only:
    - merge_requests
    - develop
    - main

test:backend:
  stage: test
  image: node:18-alpine
  services:
    - postgres:13
    - redis:6-alpine
  variables:
    POSTGRES_DB: test_db
    POSTGRES_USER: test_user
    POSTGRES_PASSWORD: test_password
    DATABASE_URL: postgresql://test_user:test_password@postgres:5432/test_db
    REDIS_URL: redis://redis:6379
  script:
    - cd backend
    - npm ci
    - npm run lint
    - npm run test:unit
    - npm run test:integration
    - npm run test:e2e
  artifacts:
    reports:
      junit: backend/test-results.xml
      coverage_report:
        coverage_format: cobertura
        path: backend/coverage/cobertura-coverage.xml
  only:
    - merge_requests
    - develop
    - main

# 构建阶段
build:frontend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - cd frontend
    - docker build -t $DOCKER_REGISTRY/frontend:$CI_COMMIT_SHA .
    - docker push $DOCKER_REGISTRY/frontend:$CI_COMMIT_SHA
    - docker tag $DOCKER_REGISTRY/frontend:$CI_COMMIT_SHA $DOCKER_REGISTRY/frontend:latest
    - docker push $DOCKER_REGISTRY/frontend:latest
  only:
    - develop
    - main

build:backend:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - cd backend
    - docker build -t $DOCKER_REGISTRY/backend:$CI_COMMIT_SHA .
    - docker push $DOCKER_REGISTRY/backend:$CI_COMMIT_SHA
    - docker tag $DOCKER_REGISTRY/backend:$CI_COMMIT_SHA $DOCKER_REGISTRY/backend:latest
    - docker push $DOCKER_REGISTRY/backend:latest
  only:
    - develop
    - main

# 安全扫描阶段
security:container-scan:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 0 --severity HIGH,CRITICAL $DOCKER_REGISTRY/frontend:$CI_COMMIT_SHA
    - trivy image --exit-code 0 --severity HIGH,CRITICAL $DOCKER_REGISTRY/backend:$CI_COMMIT_SHA
  artifacts:
    reports:
      container_scanning: security-report.json
  only:
    - develop
    - main

security:sast:
  stage: security
  image: securecodewarrior/gitlab-sast:latest
  script:
    - /analyzer run
  artifacts:
    reports:
      sast: gl-sast-report.json
  only:
    - develop
    - main

# 部署阶段
deploy:dev:
  stage: deploy-dev
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT_DEV
    - kubectl set image deployment/frontend frontend=$DOCKER_REGISTRY/frontend:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE_DEV
    - kubectl set image deployment/backend backend=$DOCKER_REGISTRY/backend:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE_DEV
    - kubectl rollout status deployment/frontend -n $KUBERNETES_NAMESPACE_DEV
    - kubectl rollout status deployment/backend -n $KUBERNETES_NAMESPACE_DEV
  environment:
    name: development
    url: https://dev.vehicle-app.com
  only:
    - develop

deploy:staging:
  stage: deploy-staging
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT_STAGING
    - kubectl set image deployment/frontend frontend=$DOCKER_REGISTRY/frontend:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE_STAGING
    - kubectl set image deployment/backend backend=$DOCKER_REGISTRY/backend:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE_STAGING
    - kubectl rollout status deployment/frontend -n $KUBERNETES_NAMESPACE_STAGING
    - kubectl rollout status deployment/backend -n $KUBERNETES_NAMESPACE_STAGING
  environment:
    name: staging
    url: https://staging.vehicle-app.com
  when: manual
  only:
    - main

deploy:production:
  stage: deploy-prod
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context $KUBE_CONTEXT_PROD
    - kubectl set image deployment/frontend frontend=$DOCKER_REGISTRY/frontend:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE_PROD
    - kubectl set image deployment/backend backend=$DOCKER_REGISTRY/backend:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE_PROD
    - kubectl rollout status deployment/frontend -n $KUBERNETES_NAMESPACE_PROD
    - kubectl rollout status deployment/backend -n $KUBERNETES_NAMESPACE_PROD
  environment:
    name: production
    url: https://www.vehicle-app.com
  when: manual
  only:
    - main
```

## 11. 测试策略

### 11.1 测试框架和工具

#### 11.1.1 前端测试

```typescript
// Jest + React Testing Library配置
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// 组件测试示例
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ProjectCard } from './ProjectCard';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProjectCard', () => {
  const mockProject = {
    id: '1',
    projectName: 'Test Project',
    status: 'Development',
    progress: 75,
    clientName: 'Test Client'
  };
  
  it('should render project information correctly', () => {
    renderWithProviders(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
  
  it('should handle click events', async () => {
    const onClickMock = jest.fn();
    renderWithProviders(
      <ProjectCard project={mockProject} onClick={onClickMock} />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(onClickMock).toHaveBeenCalledWith(mockProject);
    });
  });
  
  it('should display progress bar correctly', () => {
    renderWithProviders(<ProjectCard project={mockProject} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });
});

// Hook测试示例
import { renderHook, act } from '@testing-library/react';
import { useInfiniteScroll } from './useInfiniteScroll';

describe('useInfiniteScroll', () => {
  const mockFetchData = jest.fn();
  
  beforeEach(() => {
    mockFetchData.mockClear();
  });
  
  it('should load initial data', async () => {
    const mockData = {
      data: [{ id: 1 }, { id: 2 }],
      total: 10,
      hasNext: true
    };
    
    mockFetchData.mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData.data);
      expect(result.current.hasNext).toBe(true);
      expect(mockFetchData).toHaveBeenCalledWith(1, 20);
    });
  });
  
  it('should load more data when loadMore is called', async () => {
    const initialData = {
      data: [{ id: 1 }, { id: 2 }],
      total: 10,
      hasNext: true
    };
    
    const moreData = {
      data: [{ id: 3 }, { id: 4 }],
      total: 10,
      hasNext: true
    };
    
    mockFetchData
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(moreData);
    
    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));
    
    await waitFor(() => {
      expect(result.current.data).toEqual(initialData.data);
    });
    
    await act(async () => {
      await result.current.loadMore();
    });
    
    expect(result.current.data).toEqual([...initialData.data, ...moreData.data]);
    expect(mockFetchData).toHaveBeenCalledWith(2, 20);
  });
});
```

#### 11.1.2 后端测试

```typescript
// Jest + Supertest配置
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('ProjectController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    
    await app.init();
    await databaseService.cleanDatabase();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('/projects (GET)', () => {
    it('should return paginated projects', async () => {
      // 准备测试数据
      await databaseService.seedProjects([
        { projectName: 'Project 1', status: 'Development' },
        { projectName: 'Project 2', status: 'Testing' }
      ]);
      
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .query({ page: 1, limit: 10 })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });
    
    it('should filter projects by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .query({ status: 'Development' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
      
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('Development');
    });
    
    it('should return 401 without valid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(401);
    });
  });
  
  describe('/projects (POST)', () => {
    it('should create new project', async () => {
      const projectData = {
        projectName: 'New Project',
        clientId: 'client-uuid',
        projectType: 'AppDevelopment',
        description: 'Test project description'
      };
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .send(projectData)
        .set('Authorization', 'Bearer valid-token')
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.projectName).toBe(projectData.projectName);
      expect(response.body.data.id).toBeDefined();
    });
    
    it('should validate required fields', async () => {
      const invalidData = {
        projectName: '', // 空项目名
        clientId: 'invalid-uuid' // 无效UUID
      };
      
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .send(invalidData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('validation');
    });
  });
});

// 单元测试示例
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { CacheService } from '../cache/cache.service';
import { CreateProjectDto } from './dto/create-project.dto';

describe('ProjectService', () => {
  let service: ProjectService;
  let repository: ProjectRepository;
  let cacheService: CacheService;
  
  const mockRepository = {
    findById: jest.fn(),
    findByClientId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };
  
  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn()
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: ProjectRepository, useValue: mockRepository },
        { provide: CacheService, useValue: mockCacheService }
      ],
    }).compile();
    
    service = module.get<ProjectService>(ProjectService);
    repository = module.get<ProjectRepository>(ProjectRepository);
    cacheService = module.get<CacheService>(CacheService);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getProject', () => {
    it('should return cached project if available', async () => {
      const projectId = 'test-id';
      const cachedProject = { id: projectId, projectName: 'Cached Project' };
      
      mockCacheService.get.mockResolvedValue(cachedProject);
      
      const result = await service.getProject(projectId);
      
      expect(result).toEqual(cachedProject);
      expect(mockCacheService.get).toHaveBeenCalledWith(`project:${projectId}`);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
    
    it('should fetch from database and cache if not in cache', async () => {
      const projectId = 'test-id';
      const dbProject = { id: projectId, projectName: 'DB Project' };
      
      mockCacheService.get.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(dbProject);
      
      const result = await service.getProject(projectId);
      
      expect(result).toEqual(dbProject);
      expect(mockRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockCacheService.set).toHaveBeenCalledWith(`project:${projectId}`, dbProject, 300);
    });
    
    it('should throw NotFoundException if project not found', async () => {
      const projectId = 'non-existent-id';
      
      mockCacheService.get.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(null);
      
      await expect(service.getProject(projectId)).rejects.toThrow('Project not found');
    });
  });
  
  describe('createProject', () => {
    it('should create project successfully', async () => {
      const createDto: CreateProjectDto = {
        projectName: 'New Project',
        clientId: 'client-id',
        projectType: 'AppDevelopment',
        description: 'Test description'
      };
      
      const createdProject = { id: 'new-id', ...createDto };
      mockRepository.create.mockResolvedValue(createdProject);
      
      const result = await service.createProject(createDto);
      
      expect(result).toEqual(createdProject);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockCacheService.invalidate).toHaveBeenCalledWith('projects:*');
    });
  });
});
```

### 11.2 性能测试

#### 11.2.1 负载测试配置

```javascript
// K6性能测试脚本
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定义指标
export const errorRate = new Rate('errors');

// 测试配置
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // 逐渐增加到100用户
    { duration: '5m', target: 100 },   // 保持100用户5分钟
    { duration: '2m', target: 200 },   // 增加到200用户
    { duration: '5m', target: 200 },   // 保持200用户5分钟
    { duration: '2m', target: 0 },     // 逐渐减少到0
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'], // 99%的请求响应时间小于2秒
    http_req_failed: ['rate<0.1'],     // 错误率小于10%
    errors: ['rate<0.1'],              // 自定义错误率小于10%
  },
};

// 测试数据
const BASE_URL = 'https://api.vehicle-app.com';
let authToken = '';

// 设置阶段 - 获取认证token
export function setup() {
  const loginResponse = http.post(`${BASE_URL}/api/v1/auth/login`, {
    username: 'test@example.com',
    password: 'testpassword'
  });
  
  if (loginResponse.status === 200) {
    const responseBody = JSON.parse(loginResponse.body);
    return { token: responseBody.data.accessToken };
  }
  
  throw new Error('Failed to authenticate');
}

// 主测试函数
export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json'
  };
  
  // 测试场景1: 获取项目列表
  const projectsResponse = http.get(`${BASE_URL}/api/v1/projects?page=1&limit=20`, {
    headers: headers
  });
  
  const projectsCheck = check(projectsResponse, {
    'projects endpoint status is 200': (r) => r.status === 200,
    'projects response time < 500ms': (r) => r.timings.duration < 500,
    'projects response has data': (r) => {
      const body = JSON.parse(r.body);
      return body.success && Array.isArray(body.data);
    }
  });
  
  errorRate.add(!projectsCheck);
  
  sleep(1);
  
  // 测试场景2: 获取项目详情
  if (projectsResponse.status === 200) {
    const projectsBody = JSON.parse(projectsResponse.body);
    if (projectsBody.data && projectsBody.data.length > 0) {
      const projectId = projectsBody.data[0].id;
      
      const projectDetailResponse = http.get(`${BASE_URL}/api/v1/projects/${projectId}`, {
        headers: headers
      });
      
      const detailCheck = check(projectDetailResponse, {
        'project detail status is 200': (r) => r.status === 200,
        'project detail response time < 300ms': (r) => r.timings.duration < 300
      });
      
      errorRate.add(!detailCheck);
    }
  }
  
  sleep(1);
  
  // 测试场景3: 创建项目任务
  const createTaskResponse = http.post(`${BASE_URL}/api/v1/projects/test-project-id/tasks`, 
    JSON.stringify({
      title: `Test Task ${Math.random()}`,
      description: 'Performance test task',
      priority: 'Medium',
      estimatedHours: 8
    }), 
    { headers: headers }
  );
  
  const createCheck = check(createTaskResponse, {
    'create task status is 201': (r) => r.status === 201,
    'create task response time < 1000ms': (r) => r.timings.duration < 1000
  });
  
  errorRate.add(!createCheck);
  
  sleep(2);
}

// 清理阶段
export function teardown(data) {
  // 清理测试数据
  console.log('Cleaning up test data...');
}
```

## 12. 监控运维

### 12.1 监控体系

#### 12.1.1 Prometheus + Grafana监控

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'vehicle-app-backend'
    static_configs:
      - targets: ['backend-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s
    
  - job_name: 'vehicle-app-frontend'
    static_configs:
      - targets: ['frontend-service:80']
    metrics_path: '/metrics'
    scrape_interval: 15s
    
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
      
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
      
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

```yaml
# 告警规则配置
# alert_rules.yml
groups:
  - name: vehicle-app-alerts
    rules:
      # 应用程序告警
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} for {{ $labels.instance }}"
          
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"
          
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Database connections: {{ $value }}"
          
      - alert: RedisMemoryUsageHigh
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Redis memory usage high"
          description: "Redis memory usage: {{ $value }}%"
          
      # 基础设施告警
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod is crash looping"
          description: "Pod {{ $labels.pod }} is crash looping"
          
      - alert: NodeMemoryUsageHigh
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Node memory usage high"
          description: "Node memory usage: {{ $value }}%"
          
      - alert: NodeDiskUsageHigh
        expr: (1 - (node_filesystem_free_bytes / node_filesystem_size_bytes)) > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Node disk usage high"
          description: "Node disk usage: {{ $value }}%"
```

#### 12.1.2 应用指标收集

```typescript
// 自定义指标服务
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  });
  
  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
  });
  
  private readonly activeConnections = new Gauge({
    name: 'websocket_connections_active',
    help: 'Number of active WebSocket connections'
  });
  
  private readonly databaseQueries = new Counter({
    name: 'database_queries_total',
    help: 'Total number of database queries',
    labelNames: ['operation', 'table']
  });
  
  private readonly cacheHits = new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type']
  });
  
  private readonly cacheMisses = new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type']
  });
  
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route }, duration);
  }
  
  recordWebSocketConnection(delta: number): void {
    this.activeConnections.inc(delta);
  }
  
  recordDatabaseQuery(operation: string, table: string): void {
    this.databaseQueries.inc({ operation, table });
  }
  
  recordCacheHit(cacheType: string): void {
    this.cacheHits.inc({ cache_type: cacheType });
  }
  
  recordCacheMiss(cacheType: string): void {
    this.cacheMisses.inc({ cache_type: cacheType });
  }
  
  getMetrics(): string {
    return register.metrics();
  }
}

// 指标中间件
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metricsService: MetricsService) {}
  
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      this.metricsService.recordHttpRequest(
        req.method,
        req.route?.path || req.url,
        res.statusCode,
        duration
      );
    });
    
    next();
  }
}

// 健康检查端点
@Controller('/health')
export class HealthController {
  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
    private metricsService: MetricsService
  ) {}
  
  @Get()
  async healthCheck(): Promise<HealthCheckResponse> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version
    };
  }
  
  @Get('/ready')
  async readinessCheck(): Promise<ReadinessCheckResponse> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices()
    ]);
    
    const isReady = checks.every(check => check.status === 'fulfilled');
    
    return {
      status: isReady ? 'ready' : 'not_ready',
      checks: {
        database: checks[0].status === 'fulfilled',
        redis: checks[1].status === 'fulfilled',
        external: checks[2].status === 'fulfilled'
      }
    };
  }
  
  @Get('/metrics')
  getMetrics(): string {
    return this.metricsService.getMetrics();
  }
  
  private async checkDatabase(): Promise<boolean> {
    try {
      await this.databaseService.query('SELECT 1');
      return true;
    } catch (error) {
      throw new Error('Database check failed');
    }
  }
  
  private async checkRedis(): Promise<boolean> {
    try {
      await this.redisService.ping();
      return true;
    } catch (error) {
      throw new Error('Redis check failed');
    }
  }
  
  private async checkExternalServices(): Promise<boolean> {
    // 检查外部服务连接
    return true;
  }
}
```

### 12.2 日志管理

#### 12.2.1 结构化日志

```typescript
// 日志配置
import { Logger, LogLevel } from '@nestjs/common';
import * as winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
      service: 'vehicle-app-backend',
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV
    });
  })
);

export const winstonLogger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info'
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// 自定义日志服务
@Injectable()
export class LoggerService extends Logger {
  private readonly winston = winstonLogger;
  
  log(message: string, context?: string, meta?: any): void {
    this.winston.info(message, { context, ...meta });
  }
  
  error(message: string, trace?: string, context?: string, meta?: any): void {
    this.winston.error(message, { trace, context, ...meta });
  }
  
  warn(message: string, context?: string, meta?: any): void {
    this.winston.warn(message, { context, ...meta });
  }
  
  debug(message: string, context?: string, meta?: any): void {
    this.winston.debug(message, { context, ...meta });
  }
  
  // 业务日志方法
  logUserAction(userId: string, action: string, resource?: string, meta?: any): void {
    this.winston.info('User action', {
      userId,
      action,
      resource,
      category: 'user_action',
      ...meta
    });
  }
  
  logSecurityEvent(eventType: string, details: any): void {
    this.winston.warn('Security event', {
      eventType,
      details,
      category: 'security'
    });
  }
  
  logPerformance(operation: string, duration: number, meta?: any): void {
    this.winston.info('Performance metric', {
      operation,
      duration,
      category: 'performance',
      ...meta
    });
  }
}

// 日志拦截器
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, user } = request;
    const startTime = Date.now();
    
    // 记录请求
    this.logger.log('Incoming request', 'HTTP', {
      method,
      url,
      userId: user?.id,
      ip: request.ip,
      userAgent: request.get('User-Agent')
    });
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log('Request completed', 'HTTP', {
            method,
            url,
            statusCode: response.statusCode,
            duration,
            userId: user?.id
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error('Request failed', error.stack, 'HTTP', {
            method,
            url,
            error: error.message,
            duration,
            userId: user?.id
          });
        }
      })
    );
  }
}
```

## 13. 总结

### 13.1 技术亮点

本详细设计文档为车载应用开发服务公司门户网站提供了全面的技术实现方案，主要技术亮点包括：

1. **微服务架构**：采用模块化微服务设计，支持独立开发、部署和扩展
2. **云原生部署**：基于Kubernetes的容器化部署，支持自动伸缩和高可用
3. **多层缓存**：内存、Redis、CDN多层缓存策略，提升系统性能
4. **读写分离**：数据库读写分离和连接池优化，支持高并发访问
5. **安全防护**：完整的认证授权、数据加密、XSS防护和安全监控体系
6. **实时通信**：WebSocket支持项目协作的实时通信功能
7. **AI辅助**：代码生成、智能补全等AI工具提升开发效率

### 13.2 关键指标

系统设计目标和关键性能指标：

| 指标类型 | 目标值 | 监控方式 |
|---------|--------|---------|
| **可用性** | 99.9% | Prometheus + Grafana |
| **响应时间** | API < 500ms, 页面 < 2s | APM监控 |
| **并发能力** | 支持1万+并发用户 | 负载测试验证 |
| **数据安全** | 符合ISO 27001标准 | 安全审计 |
| **代码质量** | 覆盖率 > 80% | 自动化测试 |

### 13.3 实施建议

1. **分阶段实施**：按MVP、功能完善、性能优化三个阶段逐步实施
2. **持续集成**：建立完善的CI/CD流水线，确保代码质量和部署效率
3. **监控先行**：优先建立监控体系，确保系统可观测性
4. **安全第一**：在开发过程中持续关注安全问题，定期进行安全审计
5. **性能优化**：定期进行性能测试和优化，确保系统性能持续提升

### 13.4 维护策略

1. **定期更新**：及时更新依赖包和安全补丁
2. **容量规划**：根据业务增长调整系统容量
3. **备份恢复**：建立完善的数据备份和灾难恢复机制
4. **文档维护**：保持技术文档和操作手册的及时更新
5. **团队培训**：定期进行技术培训，提升团队技术水平

通过本详细设计文档的实施，将构建一个高性能、高可用、安全可靠的车载应用开发服务门户网站，为公司的业务发展提供强有力的技术支撑。