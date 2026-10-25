from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import ActivityEvent, JournalEntry, Permission, Profile
from app.schemas import (
    ActivityOut,
    JournalIn,
    JournalOut,
    PermissionsIn,
    PermissionsOut,
    ProfileIn,
    ProfileOut,
)

router = APIRouter(prefix="/api/v1")
PROFILE_ID = "default"
PERMISSION_DEFAULTS = PermissionsOut().model_dump()


def _log(session: AsyncSession, action: str) -> None:
    session.add(ActivityEvent(actor="You", action=action))


def _profile_out(row: Profile | None) -> ProfileOut:
    if row is None:
        return ProfileOut()
    return ProfileOut(
        grade=row.grade,
        goals=list(row.goals or []),
        gpa=row.gpa,
        no_gpa=row.no_gpa,
        parent_name=row.parent_name,
        parent_email=row.parent_email,
        parent_invited=row.parent_invited,
        onboarded=row.onboarded,
        updated_at=row.updated_at,
    )


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/profile", response_model=ProfileOut)
async def get_profile(session: AsyncSession = Depends(get_session)) -> ProfileOut:
    row = await session.get(Profile, PROFILE_ID)
    return _profile_out(row)


@router.put("/profile", response_model=ProfileOut)
async def put_profile(
    payload: ProfileIn, session: AsyncSession = Depends(get_session)
) -> ProfileOut:
    row = await session.get(Profile, PROFILE_ID)
    if row is None:
        row = Profile(id=PROFILE_ID)
        session.add(row)
    was_onboarded = row.onboarded
    row.grade = payload.grade
    row.goals = list(payload.goals)
    row.gpa = payload.gpa
    row.no_gpa = payload.no_gpa
    row.parent_name = payload.parent_name
    row.parent_email = payload.parent_email
    row.parent_invited = payload.parent_invited
    row.onboarded = payload.onboarded
    if payload.onboarded and not was_onboarded:
        _log(session, "Finished setup")
    else:
        _log(session, "Updated profile")
    await session.commit()
    await session.refresh(row)
    return _profile_out(row)


@router.get("/journal", response_model=list[JournalOut])
async def list_journal(session: AsyncSession = Depends(get_session)) -> list[JournalOut]:
    rows = await session.scalars(
        select(JournalEntry).order_by(desc(JournalEntry.created_at)).limit(20)
    )
    return [
        JournalOut(id=r.id, prompt_key=r.prompt_key, body=r.body, created_at=r.created_at)
        for r in rows
    ]


@router.post("/journal", response_model=JournalOut, status_code=201)
async def create_journal(
    payload: JournalIn, session: AsyncSession = Depends(get_session)
) -> JournalOut:
    entry = JournalEntry(prompt_key=payload.prompt_key, body=payload.body)
    session.add(entry)
    _log(session, "Saved a reflection")
    await session.commit()
    await session.refresh(entry)
    return JournalOut(
        id=entry.id, prompt_key=entry.prompt_key, body=entry.body, created_at=entry.created_at
    )


@router.get("/permissions", response_model=PermissionsOut)
async def get_permissions(session: AsyncSession = Depends(get_session)) -> PermissionsOut:
    rows = await session.scalars(select(Permission))
    values = dict(PERMISSION_DEFAULTS)
    for row in rows:
        values[row.key] = row.enabled
    return PermissionsOut(**values)


@router.put("/permissions", response_model=PermissionsOut)
async def put_permissions(
    payload: PermissionsIn, session: AsyncSession = Depends(get_session)
) -> PermissionsOut:
    changes = payload.model_dump(exclude_none=True)
    for key, enabled in changes.items():
        row = await session.get(Permission, key)
        if row is None:
            row = Permission(key=key)
            session.add(row)
        if row.enabled != enabled:
            row.enabled = enabled
            state = "on" if enabled else "off"
            _log(session, f"Turned {key.replace('_', ' ')} {state}")
    await session.commit()
    return await get_permissions(session)


@router.get("/activity", response_model=list[ActivityOut])
async def list_activity(session: AsyncSession = Depends(get_session)) -> list[ActivityOut]:
    rows = await session.scalars(
        select(ActivityEvent).order_by(desc(ActivityEvent.created_at)).limit(50)
    )
    return [
        ActivityOut(id=r.id, actor=r.actor, action=r.action, created_at=r.created_at)
        for r in rows
    ]
