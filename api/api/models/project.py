from db import db


class Project(db.Model):
    """
    Database model for a project
    """

    __tablename__ = 'projects'

    project_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(1000), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False,
                           server_default=db.func.now())
    last_edited = db.Column(db.DateTime, nullable=True,
                            server_default=db.func.now())
    project_size = db.Column(
        db.String(10), nullable=False, server_default="0B")

    def __repr__(self):
        project_id = f"project_id={self.project_id}"
        name = f"name={self.name}"
        description = f"description={self.description}"
        project_size = f"project_size={self.project_size}"

        return f"<Project({project_id}, {name}, {description} {project_size})>"

    def to_json(self):
        return {
            "project_id": self.project_id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at,
            "last_edited": self.last_edited,
            "size": self.project_size
        }
