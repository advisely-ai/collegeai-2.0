from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

Grade = Literal["sophomore", "junior", "senior"]
# "colleges" is deliberately absent: the college list is coming soon.
Goal = Literal["major_idea", "strengths", "activities"]
PromptKey = Literal["reflect_1", "reflect_2", "reflect_3"]
PermissionKey = Literal["report_read", "suggest_edits", "journal_read"]


class ProfileIn(BaseModel):
    grade: Grade | None = None
    goals: list[Goal] = Field(default_factory=list, max_length=3)
    gpa: float | None = Field(default=None, ge=0, le=4)
    no_gpa: bool = False
    parent_name: str | None = Field(default=None, max_length=120)
    parent_email: str | None = Field(
        default=None, max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    )
    parent_invited: bool = False
    onboarded: bool = False

    @model_validator(mode="after")
    def gpa_or_none(self) -> "ProfileIn":
        if self.no_gpa:
            self.gpa = None
        return self


class ProfileOut(ProfileIn):
    updated_at: datetime | None = None


class JournalIn(BaseModel):
    prompt_key: PromptKey
    body: str = Field(min_length=1, max_length=4000)

    @model_validator(mode="after")
    def strip_body(self) -> "JournalIn":
        self.body = self.body.strip()
        if not self.body:
            raise ValueError("Write a few words before saving.")
        return self


class JournalOut(BaseModel):
    id: int
    prompt_key: str
    body: str
    created_at: datetime


class PermissionsIn(BaseModel):
    report_read: bool | None = None
    suggest_edits: bool | None = None
    journal_read: bool | None = None

    @model_validator(mode="after")
    def report_read_is_required(self) -> "PermissionsIn":
        if self.report_read is False:
            raise ValueError("Reading the report is needed for the assistant to work.")
        return self


class PermissionsOut(BaseModel):
    report_read: bool = True
    suggest_edits: bool = True
    journal_read: bool = False


class ActivityOut(BaseModel):
    id: int
    actor: str
    action: str
    created_at: datetime
