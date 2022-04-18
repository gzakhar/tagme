# from dataclasses import dataclass, field
# from backend.models.base import Base, mapper_registry
# from sqlalchemy import Column, Integer, String
#
#
# @mapper_registry.mapped
# @dataclass
# class UserControl(Base):
#     __tablename__ = "user_control"
#
#     id: int = field(default=None, metadata={"sa": Column(Integer, primary_key=True)})
#     user_controls_id: int = field(default=None, metadata={"sa": Column(Integer)})
#     description: str = field(default=None, metadata={"sa": Column(String)})
