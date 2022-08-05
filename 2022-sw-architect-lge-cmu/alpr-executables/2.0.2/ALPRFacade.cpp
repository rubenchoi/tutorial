#include "ALPRFacade.h"
#include "base64.h"

std::atomic_flag ALPRFacade::keepRunning = ATOMIC_FLAG_INIT;

void ALPRFacade::stopDetect() {
    keepRunning.clear();
}



void ALPRFacade::detect(void (*pCallback)(int cmd, const std::string&s)) {

    keepRunning.test_and_set();
    frameno = 0; 

    Alpr alpr(county, "");
    alpr.setTopN(2);
    if (alpr.isLoaded() == false)
    {
        std::cerr << "Error loading OpenALPR" << std::endl;
        return;
    }

    cap.open(filename);
    if (!cap.isOpened()) {
        cout << "Error opening video file:" << filename << endl;
        return;
    }


    if (vres == VideoResolution::r1280X720)
    {
        cap.set(cv::CAP_PROP_FRAME_WIDTH, 1280);
        cap.set(cv::CAP_PROP_FRAME_HEIGHT, 720);
    }
    else if (vres == VideoResolution::r640X480)
    {
        cap.set(cv::CAP_PROP_FRAME_WIDTH, 640);
        cap.set(cv::CAP_PROP_FRAME_HEIGHT, 480);
    }
    if (mode != Mode::mImage_File)
    {
        // Default resolutions of the frame are obtained.The default resolutions are system dependent.
        int frame_width = (int)cap.get(cv::CAP_PROP_FRAME_WIDTH);
        int frame_height = (int)cap.get(cv::CAP_PROP_FRAME_HEIGHT);
        printf("Frame width= %d height=%d\n", frame_width, frame_height);


        // Define the codec and create VideoWriter object.The output is stored in 'outcpp.avi' file.
        if (videosavemode != VideoSaveMode::vNoSave)
        {

            outputVideo.open("output.avi", VideoWriter::fourcc('M', 'J', 'P', 'G'), 25, Size(frame_width, frame_height), true);
            if (!outputVideo.isOpened())
            {
                cout << "Could not open the output video for write" << endl;
                return;
            }
        }
    }

    bool bNeedSkipFrame = false;
    int skipFrames = 0;

    const double thresolder = 40;
    int intervalCount = 0;

    while (keepRunning.test_and_set()) {


        Mat frame;
        double start = CLOCK();
        // Capture frame-by-frame
        if (mode == Mode::mImage_File)
        {
            frame = imread(filename);
        }
        else cap >> frame;

        if (bNeedSkipFrame) {
            for (int i = 0; i <= skipFrames; i++) {
                cap >> frame;
            }
            printf_s("skipped  %d frame(s) on video footage\n", skipFrames);
            bNeedSkipFrame = false;
            skipFrames = 0;
        }

        // 
        // If the frame is empty, break immediately
        if (frame.empty())
            break;

        if (frameno == 0) motiondetector.ResetMotionDetection(&frame);
        if (videosavemode != VideoSaveMode::vSaveWithNoALPR)
        {
            detectandshow(&alpr, frame, "", false, pCallback );
            //GetResponses();

            cv::putText(frame, text,
                cv::Point(10, frame.rows - 10), //top-left position
                FONT_HERSHEY_COMPLEX_SMALL, 0.5,
                Scalar(0, 255, 0), 0, LINE_AA, false);

        }

        // Write the frame into the file 'outcpp.avi'
        if (videosavemode != VideoSaveMode::vNoSave)
        {
            outputVideo.write(frame);
        }

        // Display the resulting frame    
        //imshow("Frame", frame);

        if (intervalCount == interval) {
            if (pCallback)
            {
                std::vector<uchar> buff;//buffer for coding
                std::vector<int> param(2);
                param[0] = cv::IMWRITE_JPEG_QUALITY;
                param[1] = 80;//default(95) 0-100
                cv::imencode(".jpg", frame, buff, param);

                //send image to React F/E
#define CMD_JPEGIMG 1
                pCallback(CMD_JPEGIMG, base64_encode(buff.data(), buff.size() ) );
                intervalCount = 0;

            }
            //         pWebsocketServer->SendImageToFrontEnd(s);
                       //gclsStack.SendWebSocketPacket(clsServer.clientIp.c_str(), clsServer.clientPort, s.c_str(), s.length());
        }
        else
            intervalCount++;

        // Press  ESC on keyboard to  exit
        char c = (char)waitKey(1);
        if (c == 27)
            break;
        double dur = CLOCK() - start;

        if (dur > thresolder) {
            bNeedSkipFrame = true;
            skipFrames = (int)(dur / thresolder);
        }

        sprintf_s(text, "avg time per frame %f ms. fps %f. frameno = %d", avgdur(dur), avgfps(), frameno++);
        printf_s("current duration %f ms, avg time per frame %f ms. fps %f. frameno = %d\n", dur, avgdur(dur), avgfps(), frameno);
        if (frameno > 1 && mode == Mode::mImage_File)
        {
            break;
        }
    }

    // When everything done, release the video capture and write object
    cap.release();
    if (videosavemode != VideoSaveMode::vNoSave)  outputVideo.release();

    // Closes all the frames
    //destroyAllWindows();
#define CMD_FINISHED 3
    pCallback(CMD_FINISHED,"");
}

void ALPRFacade::InitCounter()
{
    LARGE_INTEGER li;
    if (!QueryPerformanceFrequency(&li))
    {
        std::cout << "QueryPerformanceFrequency failed!\n";
    }
    PCFreq = double(li.QuadPart) / 1000.0f;
    _qpcInited = true;
}

double ALPRFacade::CLOCK()
{
    if (!_qpcInited) InitCounter();
    LARGE_INTEGER li;
    QueryPerformanceCounter(&li);
    return double(li.QuadPart) / PCFreq;
}

double ALPRFacade::avgdur(double newdur)
{
    _avgdur = 0.98 * _avgdur + 0.02 * newdur;
    return _avgdur;
}
/***********************************************************************************/
/* End Avgdur                                                                      */
/***********************************************************************************/
/***********************************************************************************/
/* Avgfps                                                                          */
/***********************************************************************************/
double ALPRFacade::avgfps()
{
    if (CLOCK() - _fpsstart > 1000)
    {
        _fpsstart = CLOCK();
        _avgfps = 0.7 * _avgfps + 0.3 * _fps1sec;
        _fps1sec = 0;
    }
    _fps1sec++;
    return _avgfps;
}
/***********************************************************************************/
/*  End Avgfps                                                                     */
/***********************************************************************************/

bool ALPRFacade::detectandshow(Alpr* alpr, cv::Mat frame, std::string region, bool writeJson, void (*pCallback)(int cmd, const std::string& s))
{

    timespec startTime;
    getTimeMonotonic(&startTime);
    unsigned short SendPlateStringLength;
    ssize_t result;

    std::vector<AlprRegionOfInterest> regionsOfInterest;
    if (do_motiondetection)
    {
        cv::Rect rectan = motiondetector.MotionDetect(&frame);
        if (rectan.width > 0) regionsOfInterest.push_back(AlprRegionOfInterest(rectan.x, rectan.y, rectan.width, rectan.height));
    }
    else regionsOfInterest.push_back(AlprRegionOfInterest(0, 0, frame.cols, frame.rows));
    AlprResults results;
    if (regionsOfInterest.size() > 0) results = alpr->recognize(frame.data, (int)frame.elemSize(), frame.cols, frame.rows, regionsOfInterest);

    timespec endTime;
    getTimeMonotonic(&endTime);
    double totalProcessingTime = diffclock(startTime, endTime);
    if (measureProcessingTime)
        std::cout << "Total Time to process image: " << totalProcessingTime << "ms." << std::endl;


    if (writeJson)
    {
        std::cout << alpr->toJson(results) << std::endl;
    }
    else
    {
        char find_str_I = 'I';
        char replace_str_one = '1';
        char find_str_Q = 'Q';
        char replace_str_zero = '0';
        for (int i = 0; i < results.plates.size(); i++)
        {
            char textbuffer[1024];
            std::vector<cv::Point2f> pointset;
            for (int z = 0; z < 4; z++)
                pointset.push_back(Point2i(results.plates[i].plate_points[z].x, results.plates[i].plate_points[z].y));
            cv::Rect rect = cv::boundingRect(pointset);
            cv::rectangle(frame, rect, cv::Scalar(0, 255, 0), 2);
            replace(results.plates[i].bestPlate.characters.begin(), results.plates[i].bestPlate.characters.end(), find_str_I, replace_str_one);
            replace(results.plates[i].bestPlate.characters.begin(), results.plates[i].bestPlate.characters.end(), find_str_Q, replace_str_zero);
            sprintf_s(textbuffer, "%s - %.2f", results.plates[i].bestPlate.characters.c_str(), results.plates[i].bestPlate.overall_confidence);

            cv::putText(frame, textbuffer,
                cv::Point(rect.x, rect.y - 5), //top-left position
                FONT_HERSHEY_COMPLEX_SMALL, 1,
                Scalar(0, 255, 0), 0, LINE_AA, false);
            
            //if (TcpConnectedPort)
            //{
                bool found = false;
                for (int x = 0; x < NUMBEROFPREVIOUSPLATES; x++)
                {
                    if (strcmp(results.plates[i].bestPlate.characters.c_str(), LastPlates[x]) == 0)
                    {
                        found = true;
                        break;
                    }
                }
                if (!found)
                {
                    unsigned short SendMsgHdr;
                    SendPlateStringLength = (unsigned short)strlen(results.plates[i].bestPlate.characters.c_str()) + 1;
                    SendMsgHdr = htons(SendPlateStringLength);
                    //if ((result = (int)WriteDataTcp(TcpConnectedPort, (unsigned char*)&SendMsgHdr, sizeof(SendMsgHdr))) != sizeof(SendPlateStringLength))
                    //    printf("WriteDataTcp %d\n", result);
                    //if ((result = (int)WriteDataTcp(TcpConnectedPort, (unsigned char*)results.plates[i].bestPlate.characters.c_str(), SendPlateStringLength)) != SendPlateStringLength)
                    //    printf("WriteDataTcp %d\n", result);
                    if (pCallback)
                    {
                        std::string strOutput(results.plates[i].bestPlate.characters.c_str());

#define CMD_PLATE 2
                        pCallback(CMD_PLATE, strOutput);
                        //printf("sent ->%s\n", results.plates[i].bestPlate.characters.c_str());
                    }
                }
            //}
            strcpy_s(LastPlates[CurrentPlate], results.plates[i].bestPlate.characters.c_str());
            CurrentPlate = (CurrentPlate + 1) % NUMBEROFPREVIOUSPLATES;
#if 0
            std::cout << "plate" << i << ": " << results.plates[i].topNPlates.size() << " results";
            if (measureProcessingTime)
                std::cout << " -- Processing Time = " << results.plates[i].processing_time_ms << "ms.";
            std::cout << std::endl;

            if (results.plates[i].regionConfidence > 0)
                std::cout << "State ID: " << results.plates[i].region << " (" << results.plates[i].regionConfidence << "% confidence)" << std::endl;

            for (int k = 0; k < results.plates[i].topNPlates.size(); k++)
            {
                // Replace the multiline newline character with a dash
                std::string no_newline = results.plates[i].topNPlates[k].characters;
                std::replace(no_newline.begin(), no_newline.end(), '\n', '-');

                std::cout << "    - " << no_newline << "\t confidence: " << results.plates[i].topNPlates[k].overall_confidence;
                if (templatePattern.size() > 0 || results.plates[i].regionConfidence > 0)
                    std::cout << "\t pattern_match: " << results.plates[i].topNPlates[k].matches_template;

                std::cout << std::endl;
            }
#endif
        }
    }
    return results.plates.size() > 0;
}


