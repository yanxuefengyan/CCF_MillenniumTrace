import 'package:equatable/equatable.dart';
import 'artifact.dart';

// 时空情景实体
class SpaceTimeScene extends Equatable {
  final String id;
  final String artifactId;
  final String title;
  final String description;
  final List<SceneSegment> segments;
  final SceneSettings settings;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic> metadata;

  const SpaceTimeScene({
    required this.id,
    required this.artifactId,
    required this.title,
    required this.description,
    required this.segments,
    required this.settings,
    required this.createdAt,
    required this.updatedAt,
    required this.metadata,
  });

  @override
  List<Object> get props => [
        id,
        artifactId,
        title,
        description,
        segments,
        settings,
        createdAt,
        updatedAt,
        metadata,
      ];

  @override
  String toString() {
    return 'SpaceTimeScene(id: $id, title: $title, segments: ${segments.length})';
  }

  SpaceTimeScene copyWith({
    String? id,
    String? artifactId,
    String? title,
    String? description,
    List<SceneSegment>? segments,
    SceneSettings? settings,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return SpaceTimeScene(
      id: id ?? this.id,
      artifactId: artifactId ?? this.artifactId,
      title: title ?? this.title,
      description: description ?? this.description,
      segments: segments ?? this.segments,
      settings: settings ?? this.settings,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  factory SpaceTimeScene.fromJson(Map<String, dynamic> json) {
    return SpaceTimeScene(
      id: json['id'] as String,
      artifactId: json['artifactId'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      segments: (json['segments'] as List<dynamic>)
          .map((e) => SceneSegment.fromJson(e as Map<String, dynamic>))
          .toList(),
      settings: SceneSettings.fromJson(json['settings'] as Map<String, dynamic>),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'artifactId': artifactId,
      'title': title,
      'description': description,
      'segments': segments.map((e) => e.toJson()).toList(),
      'settings': settings.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

// 场景段
class SceneSegment extends Equatable {
  final String id;
  final String title;
  final String description;
  final SceneSegmentType type;
  final int duration;
  final String? audioNarration;
  final List<SceneObject> objects;
  final List<SceneEffect> effects;
  final Map<String, dynamic> metadata;

  const SceneSegment({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.duration,
    this.audioNarration,
    required this.objects,
    required this.effects,
    required this.metadata,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        type,
        duration,
        audioNarration,
        objects,
        effects,
        metadata,
      ];

  factory SceneSegment.fromJson(Map<String, dynamic> json) {
    return SceneSegment(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      type: SceneSegmentType.fromString(json['type'] as String),
      duration: json['duration'] as int,
      audioNarration: json['audioNarration'] as String?,
      objects: (json['objects'] as List<dynamic>)
          .map((e) => SceneObject.fromJson(e as Map<String, dynamic>))
          .toList(),
      effects: (json['effects'] as List<dynamic>)
          .map((e) => SceneEffect.fromJson(e as Map<String, dynamic>))
          .toList(),
      metadata: json['metadata'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type.name,
      'duration': duration,
      'audioNarration': audioNarration,
      'objects': objects.map((e) => e.toJson()).toList(),
      'effects': effects.map((e) => e.toJson()).toList(),
      'metadata': metadata,
    };
  }
}

// 场景段类型
enum SceneSegmentType {
  creation('创作'),
  circulation('流传'),
  museumEntry('入藏'),
  restoration('修复'),
  digitalReturn('数字归还');

  const SceneSegmentType(this.displayName);

  final String displayName;

  static SceneSegmentType fromString(String value) {
    return SceneSegmentType.values.firstWhere(
      (type) => type.name == value,
      orElse: () => SceneSegmentType.creation,
    );
  }
}

// 场景对象
class SceneObject extends Equatable {
  final String id;
  final String name;
  final String modelUrl;
  final SceneObjectType type;
  final SceneTransform transform;
  final Map<String, dynamic> properties;

  const SceneObject({
    required this.id,
    required this.name,
    required this.modelUrl,
    required this.type,
    required this.transform,
    required this.properties,
  });

  @override
  List<Object> get props => [id, name, modelUrl, type, transform, properties];

  factory SceneObject.fromJson(Map<String, dynamic> json) {
    return SceneObject(
      id: json['id'] as String,
      name: json['name'] as String,
      modelUrl: json['modelUrl'] as String,
      type: SceneObjectType.fromString(json['type'] as String),
      transform: SceneTransform.fromJson(json['transform'] as Map<String, dynamic>),
      properties: json['properties'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'modelUrl': modelUrl,
      'type': type.name,
      'transform': transform.toJson(),
      'properties': properties,
    };
  }
}

// 场景对象类型
enum SceneObjectType {
  artifact('藏品'),
  character('人物'),
  environment('环境'),
  effect('特效'),
  ui('界面元素');

  const SceneObjectType(this.displayName);

  final String displayName;

  static SceneObjectType fromString(String value) {
    return SceneObjectType.values.firstWhere(
      (type) => type.name == value,
      orElse: () => SceneObjectType.artifact,
    );
  }
}

// 场景变换
class SceneTransform extends Equatable {
  final SceneVector3 position;
  final SceneVector3 rotation;
  final SceneVector3 scale;

  const SceneTransform({
    required this.position,
    required this.rotation,
    required this.scale,
  });

  @override
  List<Object> get props => [position, rotation, scale];

  factory SceneTransform.fromJson(Map<String, dynamic> json) {
    return SceneTransform(
      position: SceneVector3.fromJson(json['position'] as Map<String, dynamic>),
      rotation: SceneVector3.fromJson(json['rotation'] as Map<String, dynamic>),
      scale: SceneVector3.fromJson(json['scale'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'position': position.toJson(),
      'rotation': rotation.toJson(),
      'scale': scale.toJson(),
    };
  }
}

// 3D向量
class SceneVector3 extends Equatable {
  final double x;
  final double y;
  final double z;

  const SceneVector3({
    required this.x,
    required this.y,
    required this.z,
  });

  @override
  List<Object> get props => [x, y, z];

  factory SceneVector3.fromJson(Map<String, dynamic> json) {
    return SceneVector3(
      x: (json['x'] as num).toDouble(),
      y: (json['y'] as num).toDouble(),
      z: (json['z'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'x': x,
      'y': y,
      'z': z,
    };
  }
}

// 场景特效
class SceneEffect extends Equatable {
  final String id;
  final String name;
  final SceneEffectType type;
  final Map<String, dynamic> parameters;
  final double startTime;
  final double duration;

  const SceneEffect({
    required this.id,
    required this.name,
    required this.type,
    required this.parameters,
    required this.startTime,
    required this.duration,
  });

  @override
  List<Object> get props => [id, name, type, parameters, startTime, duration];

  factory SceneEffect.fromJson(Map<String, dynamic> json) {
    return SceneEffect(
      id: json['id'] as String,
      name: json['name'] as String,
      type: SceneEffectType.fromString(json['type'] as String),
      parameters: json['parameters'] as Map<String, dynamic>,
      startTime: (json['startTime'] as num).toDouble(),
      duration: (json['duration'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type.name,
      'parameters': parameters,
      'startTime': startTime,
      'duration': duration,
    };
  }
}

// 场景特效类型
enum SceneEffectType {
  particle('粒子效果'),
  lighting('光照效果'),
  animation('动画效果'),
  sound('音效'),
  transition('转场效果');

  const SceneEffectType(this.displayName);

  final String displayName;

  static SceneEffectType fromString(String value) {
    return SceneEffectType.values.firstWhere(
      (type) => type.name == value,
      orElse: () => SceneEffectType.particle,
    );
  }
}

// 场景设置
class SceneSettings extends Equatable {
  final SceneQuality quality;
  final bool autoPlay;
  final bool loop;
  final double volume;
  final List<String> availableEffects;
  final Map<String, dynamic> customSettings;

  const SceneSettings({
    required this.quality,
    required this.autoPlay,
    required this.loop,
    required this.volume,
    required this.availableEffects,
    required this.customSettings,
  });

  @override
  List<Object> get props => [
        quality,
        autoPlay,
        loop,
        volume,
        availableEffects,
        customSettings,
      ];

  factory SceneSettings.fromJson(Map<String, dynamic> json) {
    return SceneSettings(
      quality: SceneQuality.fromString(json['quality'] as String),
      autoPlay: json['autoPlay'] as bool,
      loop: json['loop'] as bool,
      volume: (json['volume'] as num).toDouble(),
      availableEffects: (json['availableEffects'] as List<dynamic>).cast<String>(),
      customSettings: json['customSettings'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'quality': quality.name,
      'autoPlay': autoPlay,
      'loop': loop,
      'volume': volume,
      'availableEffects': availableEffects,
      'customSettings': customSettings,
    };
  }
}

// 场景质量
enum SceneQuality {
  low('低质量'),
  medium('中等质量'),
  high('高质量'),
  ultra('超高质量');

  const SceneQuality(this.displayName);

  final String displayName;

  static SceneQuality fromString(String value) {
    return SceneQuality.values.firstWhere(
      (quality) => quality.name == value,
      orElse: () => SceneQuality.medium,
    );
  }
}