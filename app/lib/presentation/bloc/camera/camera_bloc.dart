import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:camera/camera.dart';

import '../../../domain/entities/artifact.dart';
import '../../../domain/usecases/recognize_artifact.dart';

part 'camera_event.dart';
part 'camera_state.dart';

class CameraBloc extends Bloc<CameraEvent, CameraState> {
  final RecognizeArtifact _recognizeArtifact;
  
  CameraController? _cameraController;
  List<CameraDescription> _cameras = [];
  bool _isInitialized = false;

  CameraBloc(this._recognizeArtifact) : super(const CameraState.initial()) {
    on<InitializeCamera>(_onInitializeCamera);
    on<SwitchCamera>(_onSwitchCamera);
    on<CapturePhoto>(_onCapturePhoto);
    on<RecognizeArtifact>(_onRecognizeArtifact);
    on<StartRecognition>(_onStartRecognition);
    on<StopRecognition>(_onStopRecognition);
    on<ResetCamera>(_onResetCamera);
  }

  Future<void> _onInitializeCamera(
    InitializeCamera event,
    Emitter<CameraState> emit,
  ) async {
    try {
      emit(const CameraState.loading());
      
      // 获取可用摄像头
      _cameras = await availableCameras();
      
      if (_cameras.isEmpty) {
        emit(const CameraState.error('没有可用的摄像头'));
        return;
      }
      
      // 使用后置摄像头（如果有）
      final camera = _cameras.firstWhere(
        (camera) => camera.lensDirection == CameraLensDirection.back,
        orElse: () => _cameras.first,
      );
      
      // 初始化摄像头控制器
      _cameraController = CameraController(
        camera,
        ResolutionPreset.high,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );
      
      await _cameraController!.initialize();
      _isInitialized = true;
      
      emit(CameraState.ready(
        cameraController: _cameraController!,
        cameras: _cameras,
        currentCameraIndex: _cameras.indexOf(camera),
      ));
      
    } catch (e) {
      emit(CameraState.error('摄像头初始化失败: ${e.toString()}'));
    }
  }

  Future<void> _onSwitchCamera(
    SwitchCamera event,
    Emitter<CameraState> emit,
  ) async {
    final currentState = state;
    if (currentState is! CameraReady) return;
    
    try {
      final nextIndex = (currentState.currentCameraIndex + 1) % _cameras.length;
      final nextCamera = _cameras[nextIndex];
      
      // 释放当前控制器
      await _cameraController?.dispose();
      
      // 创建新的控制器
      _cameraController = CameraController(
        nextCamera,
        ResolutionPreset.high,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );
      
      await _cameraController!.initialize();
      
      emit(currentState.copyWith(
        cameraController: _cameraController,
        currentCameraIndex: nextIndex,
      ));
      
    } catch (e) {
      emit(CameraState.error('切换摄像头失败: ${e.toString()}'));
    }
  }

  Future<void> _onCapturePhoto(
    CapturePhoto event,
    Emitter<CameraState> emit,
  ) async {
    final currentState = state;
    if (currentState is! CameraReady || _cameraController == null) return;
    
    try {
      emit(currentState.copyWith(isCapturing: true));
      
      final image = await _cameraController!.takePicture();
      emit(currentState.copyWith(
        isCapturing: false,
        capturedImage: image,
      ));
      
      // 自动开始识别
      add(RecognizeArtifact(image.path));
      
    } catch (e) {
      emit(CameraState.error('拍照失败: ${e.toString()}'));
    }
  }

  Future<void> _onRecognizeArtifact(
    RecognizeArtifact event,
    Emitter<CameraState> emit,
  ) async {
    final currentState = state;
    if (currentState is! CameraReady) return;
    
    try {
      emit(currentState.copyWith(isRecognizing: true));
      
      final result = await _recognizeArtifact.call(RecognizeArtifactParams(event.imagePath));
      
      if (result.artifact != null) {
        emit(currentState.copyWith(
          isRecognizing: false,
          recognitionResult: result,
          recognizedArtifact: result.artifact,
        ));
      } else {
        emit(currentState.copyWith(
          isRecognizing: false,
          recognitionError: '未识别到有效藏品，请重新拍照',
        ));
      }
      
    } catch (e) {
      emit(CameraState.error('识别失败: ${e.toString()}'));
    }
  }

  void _onStartRecognition(
    StartRecognition event,
    Emitter<CameraState> emit,
  ) {
    final currentState = state;
    if (currentState is! CameraReady) return;
    
    // TODO: 实现实时识别逻辑
    emit(currentState.copyWith(isRealTimeRecognition: true));
  }

  void _onStopRecognition(
    StopRecognition event,
    Emitter<CameraState> emit,
  ) {
    final currentState = state;
    if (currentState is! CameraReady) return;
    
    emit(currentState.copyWith(isRealTimeRecognition: false));
  }

  Future<void> _onResetCamera(
    ResetCamera event,
    Emitter<CameraState> emit,
  ) async {
    await _cameraController?.dispose();
    _cameraController = null;
    _isInitialized = false;
    emit(const CameraState.initial());
  }

  @override
  Future<void> close() async {
    await _cameraController?.dispose();
    super.close();
  }
}