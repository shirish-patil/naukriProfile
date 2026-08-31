Feature: Daily Naukri profile auto-update
  As a job seeker
  I want my Naukri profile to be refreshed every day by re-uploading my resume
  So that my profile stays at the top of recruiter search results

  Scenario: Update profile by re-uploading the resume
    Given I have a valid Naukri session
    When I navigate to the Naukri homepage
    And I open the profile section
    And I upload my CV from the configured location
    Then the profile should be updated successfully
