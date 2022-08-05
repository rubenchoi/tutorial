echo "If failed, then please remove created files"

mklink /D runtime_data\keypoints    ..\..\1.0\runtime_data\keypoints
mklink /D runtime_data\ocr          ..\..\1.0\runtime_data\ocr
mklink /D runtime_data\postprocess  ..\..\1.0\runtime_data\postprocess
mklink /D runtime_data\region       ..\..\1.0\runtime_data\region
mklink /D runtime_data\runtime_data ..\..\1.0\runtime_data\runtime_data
mklink    runtime_data\cameras.yaml ..\..\1.0\runtime_data\cameras.yaml

mklink liblept-DLL.dll ..\1.0\liblept-DLL.dll
mklink libtesseract-DLL.dll ..\1.0\libtesseract-DLL.dll
mklink opencv_videoio_ffmpeg455_64.dll ..\1.0\opencv_videoio_ffmpeg455_64.dll
mklink opencv_videoio_msmf455_64.dll ..\1.0\opencv_videoio_msmf455_64.dll
mklink opencv_world455.dll ..\1.0\opencv_world455.dll
mklink WebSocketEchoClient.html ..\1.0\WebSocketEchoClient.html