part of 'camera_bloc.dart';

import 'package:camera/camera.dart';
import '../../../domain/entities/artifact.dart';

class CameraState extends Equatable {
  final CameraStatus status;
  final CameraController? cameraController;
  final List<CameraDescription> cameras;
  final int currentCameraIndex;
  final FlashMode flashMode;
  final double zoomLevel;
  final double exposureOffset;
  final CameraMode cameraMode;
  final String? currentFilter;
  final ResolutionPreset resolution;
  final bool isCapturing;
  final bool isRecording;
  final bool isRecognizing;
  final bool isRealTimeRecognition;
  final XFile? capturedImage;
  final XFile? recordedVideo;
  final RecognitionResult? recognitionResult;
  final Artifact? recognizedArtifact;
  final String? recognitionError;
  final String? errorMessage;

  const CameraState({
    required this.status,
    this.cameraController,
    this.cameras = const [],
    this.currentCameraIndex = 0,
    this.flashMode = FlashMode.auto,
    this.zoomLevel = 1.0,
    this.exposureOffset = 0.0,
    this.cameraMode = CameraMode.photo,
    this.currentFilter,
    this.resolution = ResolutionPreset.high,
    this.isCapturing = false,
    this.isRecording = false,
    this.isRecognizing = false,
    this.isRealTimeRecognition = false,
    this.capturedImage,
    this.recordedVideo,
    this.recognitionResult,
    this.recognizedArtifact,
    this.recognitionError,
    this.errorMessage,
  });

  const CameraState.initial()
      : status = CameraStatus.initial,
        cameraController = null,
        cameras = const [],
        currentCameraIndex = 0,
        flashMode = FlashMode.auto,
        zoomLevel = 1.0,
        exposureOffset = 0.0,
        cameraMode = CameraMode.photo,
        currentFilter = null,
        resolution = ResolutionPreset.high,
        isCapturing = false,
        isRecording = false,
        isRecognizing = false,
        isRealTimeRecognition = false,
        capturedImage = null,
        recordedVideo = null,
        recognitionResult = null,
        recognizedArtifact = null,
        recognitionError = null,
        errorMessage = null;

  const CameraState.loading()
      : status = CameraStatus.loading,
        cameraController = null,
        cameras = const [],
        currentCameraIndex = 0,
        flashMode = FlashMode.auto,
        zoomLevel = 1.0,
        exposureOffset = 0.0,
        cameraMode = CameraMode.photo,
        currentFilter = null,
        resolution = ResolutionPreset.high,
        isCapturing = false,
        isRecording = false,
        isRecognizing = false,
        isRealTimeRecognition = false,
        capturedImage = null,
        recordedVideo = null,
        recognitionResult = null,
        recognizedArtifact = null,
        recognitionError = null,
        errorMessage = null;

  const CameraState.ready({
    required this.cameraController,
    required this.cameras,
    required this.currentCameraIndex,
    this.flashMode = FlashMode.auto,
    this.zoomLevel = 1.0,
    this.exposureOffset = 0.0,
    this.cameraMode = CameraMode.photo,
    this.currentFilter,
    this.resolution = ResolutionPreset.high,
    this.isCapturing = false,
    this.isRecording = false,
    this.isRecognizing = false,
    this.isRealTimeRecognition = false,
    this.capturedImage,
    this.recordedVideo,
    this.recognitionResult,
    this.recognizedArtifact,
    this.recognitionError,
  }) : status = CameraStatus.ready,
       errorMessage = null;

  const CameraState.error(String message)
      : status = CameraStatus.error,
        cameraController = null,
        cameras = const [],
        currentCameraIndex = 0,
        flashMode = FlashMode.auto,
        zoomLevel = 1.0,
        exposureOffset = 0.0,
        cameraMode = CameraMode.photo,
        currentFilter = null,
        resolution = ResolutionPreset.high,
        isCapturing = false,
        isRecording = false,
        isRecognizing = false,
        isRealTimeRecognition = false,
        capturedImage = null,
        recordedVideo = null,
        recognitionResult = null,
        recognizedArtifact = null,
        recognitionError = null,
        errorMessage = message;

  CameraState copyWith({
    CameraStatus? status,
    CameraController? cameraController,
    List<CameraDescription>? cameras,
    int? currentCameraIndex,
    FlashMode? flashMode,
    double? zoomLevel,
    double? exposureOffset,
    CameraMode? cameraMode,
    String? currentFilter,
    ResolutionPreset? resolution,
    bool? isCapturing,
    bool? isRecording,
    bool? isRecognizing,
    bool? isRealTimeRecognition,
    XFile? capturedImage,
    XFile? recordedVideo,
    RecognitionResult? recognitionResult,
    Artifact? recognizedArtifact,
    String? recognitionError,
    String? errorMessage,
  }) {
    return CameraState(
      status: status ?? this.status,
      cameraController: cameraController ?? this.cameraController,
      cameras: cameras ?? this.cameras,
      currentCameraIndex: currentCameraIndex ?? this.currentCameraIndex,
      flashMode: flashMode ?? this.flashMode,
      zoomLevel: zoomLevel ?? this.zoomLevel,
      exposureOffset: exposureOffset ?? this.exposureOffset,
      cameraMode: cameraMode ?? this.cameraMode,
      currentFilter: currentFilter ?? this.currentFilter,
      resolution: resolution ?? this.resolution,
      isCapturing: isCapturing ?? this.isCapturing,
      isRecording: isRecording ?? this.isRecording,
      isRecognizing: isRecognizing ?? this.isRecognizing,
      isRealTimeRecognition: isRealTimeRecognition ?? this.isRealTimeRecognition,
      capturedImage: capturedImage ?? this.capturedImage,
      recordedVideo: recordedVideo ?? this.recordedVideo,
      recognitionResult: recognitionResult ?? this.recognitionResult,
      recognizedArtifact: recognizedArtifact ?? this.recognizedArtifact,
      recognitionError: recognitionError ?? this.recognitionError,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        cameraController,
        cameras,
        currentCameraIndex,
        flashMode,
        zoomLevel,
        exposureOffset,
        cameraMode,
        currentFilter,
        resolution,
        isCapturing,
        isRecording,
        isRecognizing,
        isRealTimeRecognition,
        capturedImage,
        recordedVideo,
        recognitionResult,
        recognizedArtifact,
        recognitionError,
        errorMessage,
      ];

  @override
  String toString() {
    return 'CameraState(status: $status, cameraMode: $cameraMode, isRecognizing: $isRecognizing)';
  }

  // 便捷方法
  bool get isInitial => status == CameraStatus.initial;
  bool get isLoading => status == CameraStatus.loading;
  bool get isReady => status == CameraStatus.ready;
  bool get hasError => status == CameraStatus.error;
  
  bool get hasCapturedImage => capturedImage != null;
  bool get hasRecordedVideo => recordedVideo != null;
  bool get hasRecognitionResult => recognitionResult != null;
  bool get hasRecognizedArtifact => recognizedArtifact != null;
  bool get hasRecognitionError => recognitionError != null;
  
  // 当前摄像头信息
  CameraDescription? get currentCamera {
    if (cameras.isEmpty || currentCameraIndex >= cameras.length) {
      return null;
    }
    return cameras[currentCameraIndex];
  }
  
  // 是否为前置摄像头
  bool get isFrontCamera {
    final camera = currentCamera;
    return camera?.lensDirection == CameraLensDirection.front;
  }
  
  // 是否为后置摄像头
  bool get isBackCamera {
    final camera = currentCamera;
    return camera?.lensDirection == CameraLensDirection.back;
  }
  
  // 是否支持闪光灯
  bool get supportsFlash {
    final camera = currentCamera;
    return camera != null && camera.hasFlash;
  }
  
  // 最大缩放级别
  double get maxZoomLevel {
    final camera = currentCamera;
    return camera?.maxZoomLevel ?? 1.0;
  }
  
  // 最小缩放级别
  double get minZoomLevel {
    final camera = currentCamera;
    return camera?.minZoomLevel ?? 1.0;
  }
}

// 相机状态枚举
enum CameraStatus {
  initial,
  loading,
  ready,
  error,
}

// 相机模式枚举（从camera_event.dart移过来避免重复）
enum CameraMode {
  photo,
  video,
  document,
  qr,
}