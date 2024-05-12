# CS30 Main - Podcast Editor

This repository contains the code for Podcast Editor, a project created by University of Glasgow students as part of the third-year group project.

Major features include:
- [x] Importing multimedia files
- [x] Syncing different audio and video sources
- [x] User-controlled trimming and clipping
- [x] Podcast export options
- [x] Automatic removal of 'dead sections' (and user ability to tweak)
- [x] Automatic audio mastering (and user ability to tweak)
- [x] Persistent video editing sessions
- [x] Dummy login page

A key aim of the project is to create an application that is accessible to users of multiple skill levels. As such, many features must have an automatic mode (handled entirely by the application) **as well as** the ability for more experienced users to manually tweak their work.

## User Guide

### Installation and Build:
1. Please ensure you have [Docker Compose installed](https://docs.docker.com/compose/install/).
2. (Optional) After cloning the repo, go to `.env` and change the credentials.
3. Run `docker compose -f docker-compose.prod.yml up` from the project's root directory.
4. Visit `http://localhost:3000/`

### What happens when I am on the landing page?
1. Press the `Create Podcast` button to be taken to the podcast creation page.
2. Before you can press `Start Editing`, you must:
    - a. Name your project.
    - b. Select either `Waveform` or `Regular` editing.
    - c. Upload podcast content.

### Uploading podcast content
To ensure that the editor works best, please read the following guidelines for uploading podcast content:
- **General** - Upload a wide-shot here. This does not need audio.
- **Participant 1** - Upload separate audio (.wav) and video (.mp4) for the first speaker. Please ensure that these start and end at the same time.
- **Participant 2** - Upload separate audio (.wav) and video (.mp4) for the second speaker. Please ensure that these start and end at the same time.

#### Other notes:
- If the system fails to sync Participants 1 and 2, it will just use Participant 1. Therefore, make this the dominant speaker. 
- Additionally, if you wish to create a 1-person podcast, upload an mp4 file to Participant 1 (this must include audio).
- To give the system the best chance of working, try to pre-sync speakers. This doesn't need to be perfect, but they should start and end at roughly the same time.
- Ensure that the aspect ratio of both videos is the same.

### Transcript based editing:
After you press `Start Editing` you will be taken to the editor page. When you initially create the podcast, this may take a **long** time to load as a lot of processing is happening. Once it has loaded, use the following tips to edit:
- Click on the word in the transcript. This will bring up two options:
    - `Seek` - move the editor to this point of the podcast.
    - `Delete` - remove this word from the podcast.
    - `Undo` - re-add a deleted word to the podcast.

## Project Dependencies

## Authors
Jamie Robb, Ewan Hibberd, Boris Velinov, Michael Anderson, Miko Osak, Arif Yakupogullari