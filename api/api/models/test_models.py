from models.project import Project


def test_new_project():
    """
    GIVEN a Project model
    WHEN a new Project is created
    THEN check the project_name and size fields are defined correctly
    """

    project = Project(name="New Project", project_size=0)
    assert project.name == 'New Project'
    assert project.project_size == 0


def test_project_json_conversion():
    """
    GIVEN a Project model instance
    WHEN it is converted to JSON
    THEN check if the JSON format is as expected
    """

    project = Project(
        name="Test Project",
        description="This is a test project",
        project_size="10MB"
    )

    expected_json = {
        "project_id": None,
        "name": "Test Project",
        "description": "This is a test project",
        "created_at": project.created_at,
        "last_edited": project.last_edited,
        "size": "10MB"
    }

    assert project.to_json() == expected_json
