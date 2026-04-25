from django.urls import path

from .views import (
    BaselineView,
    CurrentExperimentView,
    DailyCheckinView,
    ExperimentResultView,
    ExperimentTemplatesView,
    RestartExperimentView,
    StartExperimentView,
    SuggestSubExperimentsView,
    ToggleExperimentView,
    UserExperimentsView,
)

urlpatterns = [
    path("start/", StartExperimentView.as_view()),
    path("current/", CurrentExperimentView.as_view()),
    path("checkin/", DailyCheckinView.as_view()),
    path("result/<int:exp_id>/", ExperimentResultView.as_view()),
    path("baseline/", BaselineView.as_view()),
    path("all/", UserExperimentsView.as_view()),
    path("templates/", ExperimentTemplatesView.as_view()),
    path("toggle/", ToggleExperimentView.as_view()),
    path("restart/", RestartExperimentView.as_view()),
    path("suggest/", SuggestSubExperimentsView.as_view()),
]
