part of 'camera_bloc.dart';

abstract class CameraEvent extends Equatable {
  const CameraEvent();

  @override
  List<Object> get props => [];
}

// 初始化相机
class InitializeCamera extends CameraEvent {}

// 切换相机
class SwitchCamera extends CameraEvent {}

// 拍照
class CapturePhoto extends CameraEvent {}

// 识别藏品
class RecognizeArtifact extends CameraEvent {
  final String imagePath;

  const RecognizeArtifact(this.imagePath);

  @override
  List<Object> get props => [imagePath];
}

// 开始实时识别
class StartRecognition extends CameraEvent {}

// 停止实时识别
class StopRecognition extends CameraEvent {}

// 重置相机
class ResetCamera extends CameraEvent {}

// 设置闪光灯
class SetFlashMode extends CameraEvent {
  final FlashMode flashMode;

  const SetFlashMode(this.flashMode);

  @override
  List<Object> get props => [flashMode];
}

// 设置焦距
class SetZoomLevel extends CameraEvent {
  final double zoomLevel;

  const SetZoomLevel(this.zoomLevel);

  @override
  List<Object> get props => [zoomLevel];
}

// 设置曝光
class SetExposureOffset extends CameraEvent {
  final double exposureOffset;

  const SetExposureOffset(this.exposureOffset);

  @override
  List<Object> get props => [exposureOffset];
}

// 聚焦
class FocusPoint extends CameraEvent {
  final Offset point;

  const FocusPoint(this.point);

  @override
  List<Object> get props => [point];
}

// 录制视频
class StartVideoRecording extends CameraEvent {}

class StopVideoRecording extends CameraEvent {}

// 切换相机模式
class SwitchCameraMode extends CameraEvent {
  final CameraMode mode;

  const SwitchCameraMode(this.mode);

  @override
  List<Object> get props => [mode];
}

// 相机模式枚举
enum CameraMode {
  photo,
  video,
  document,
  qr,
}

// 设置滤镜
class SetFilter extends CameraEvent {
  final String filterId;

  const SetFilter(this.filterId);

  @override
  List<Object> get props => [filterId];
}

// 设置分辨率
class SetResolution extends CameraEvent {
  final ResolutionPreset resolution;

  const SetResolution(this.resolution);

  @override
  List<Object> get props => [resolution];
}