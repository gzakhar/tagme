from dataclasses import dataclass, field
from sqlalchemy.orm import registry, sessionmaker
from sqlalchemy import create_engine, MetaData, Column, String, Integer
import sqlalchemy as sa

engine = create_engine('postgresql+psycopg2://postgres:password@db:5432/postgres')
Session = sessionmaker(engine)
metadata = MetaData()
mapper_registry = registry(metadata=metadata)

SA_ACCESSOR = "_sa_instance_state"

@dataclass
class Base:
    __sa_dataclass_metadata_key__ = "sa"

    @classmethod
    def create(cls, **kwargs):
        """Will be using."""

        session = Session(expire_on_commit=False)
        session.begin()

        instance = cls(**kwargs)
        session.add(instance)

        session.commit()
        session.close()

        return instance

    @classmethod
    def get(cls, parent_session=None, where=True):
        """Get all by class."""

        if not parent_session:
            session = Session(expire_on_commit=False)
            session.begin()
        else:
            session = parent_session

        stmt = sa.select(cls).where(where)
        result = session.execute(stmt).scalars().all()


        if not parent_session:
            session.commit()
            session.close()

        return result

    @classmethod
    def get_one(cls, where=True):
        """Get one."""
        result = cls.get(where=where)

        if len(result) == 0:
            raise ValueError("Row not found with.")
        elif len(result) > 1:
            raise ValueError(
                f"Get one expects exactly one row, {len(result)} rows found."
            )
        return result[0]

    @classmethod
    def delete(cls, where=True):
        """Delete."""

        session = Session(expire_on_commit=False)
        session.begin()

        stmt = sa.select(cls).where(where)
        result = session.execute(stmt).scalars().all()
        for instance in result:
            session.delete(instance)

        session.commit()
        session.close()

        return result

    @classmethod
    def upsert(cls, where=None, update=None):
        """Upsert."""

        session = Session(expire_on_commit=False)
        session.begin()

        if not update:
            raise ValueError("Update arg must be provided.")

        result = cls.get(parent_session=session, where=where)
        if len(result) == 0:
            instance = update
            session.add(instance)
        elif len(result) == 1:
            instance = result[0]
            for key, val in update.as_dict().items():
                if (val is None) or (SA_ACCESSOR in key):
                    continue
                setattr(instance, key, val)
        else:
            raise ValueError("Cannot upsert on more than one rows.")

        session.commit()
        session.close()

        return instance

    def __str__(self):
        """Override to string method."""
        return "<{klass} @{id:x} {attrs}>".format(
            klass=self.__class__.__name__,
            id=id(self) & 0xFFFFFF,
            attrs=" ".join(
                "{}={!r}".format(k, v)
                for k, v in self.__dict__.items()
                if SA_ACCESSOR not in k
            ),
        )

    def as_dict(self):
        """Convert object to dictionary."""
        return {k: v for k, v in self.__dict__.items() if SA_ACCESSOR not in k}


@mapper_registry.mapped
@dataclass
class UserControl(Base):
    __tablename__ = "user_control"

    id: int = field(default=None, metadata={"sa": Column(Integer, primary_key=True)})
    user_control_id: int = field(default=None, metadata={"sa": Column(Integer)})
    description: str = field(default=None, metadata={"sa": Column(String)})
    location: str = field(default=None, metadata={"sa": Column(String)})


@mapper_registry.mapped
@dataclass
class Tag(Base):
    __tablename__ = "tag"

    id: int = field(default=None, metadata={"sa": Column(Integer, primary_key=True)})
    description: str = field(default=None, metadata={"sa": Column(String, unique=True)})


metadata.create_all(engine)
