from pydantic import BaseModel

class LearningPlanRequest(BaseModel):
    goal: str
    duration: str

class ResourceItem(BaseModel):
    title: str
    type: str
    url: str
    description: str

class TaskItem(BaseModel):
    label: str
    tasks: list[str]
    resources: list[ResourceItem] = []  # ADD THIS LINE
    status: bool = False

class LearningPlanResponse(BaseModel):
    goalTitle: str
    totalDays: int
    monthlyTasks: list[TaskItem]
    weeklyTasks: list[TaskItem]
    dailyTasks: list[TaskItem]