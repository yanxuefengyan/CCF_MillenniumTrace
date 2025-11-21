import 'package:equatable/equatable.dart';

// 藏品实体
class Artifact extends Equatable {
  final String id;
  final String name;
  final String description;
  final String category;
  final String period;
  final String material;
  final String size;
  final String location;
  final List<String> images;
  final List<String> tags;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic> metadata;

  const Artifact({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.period,
    required this.material,
    required this.size,
    required this.location,
    required this.images,
    required this.tags,
    required this.createdAt,
    required this.updatedAt,
    required this.metadata,
  });

  @override
  List<Object> get props => [
        id,
        name,
        description,
        category,
        period,
        material,
        size,
        location,
        images,
        tags,
        createdAt,
        updatedAt,
        metadata,
      ];

  @override
  String toString() {
    return 'Artifact(id: $id, name: $name, category: $category, period: $period)';
  }

  Artifact copyWith({
    String? id,
    String? name,
    String? description,
    String? category,
    String? period,
    String? material,
    String? size,
    String? location,
    List<String>? images,
    List<String>? tags,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return Artifact(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      period: period ?? this.period,
      material: material ?? this.material,
      size: size ?? this.size,
      location: location ?? this.location,
      images: images ?? this.images,
      tags: tags ?? this.tags,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  // 从JSON创建
  factory Artifact.fromJson(Map<String, dynamic> json) {
    return Artifact(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      category: json['category'] as String,
      period: json['period'] as String,
      material: json['material'] as String,
      size: json['size'] as String,
      location: json['location'] as String,
      images: (json['images'] as List<dynamic>).cast<String>(),
      tags: (json['tags'] as List<dynamic>).cast<String>(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>,
    );
  }

  // 转换为JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'period': period,
      'material': material,
      'size': size,
      'location': location,
      'images': images,
      'tags': tags,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

// 藏品分类枚举
enum ArtifactCategory {
  ceramics('陶瓷器'),
  bronze('青铜器'),
  jade('玉器'),
  painting('书画'),
  sculpture('雕塑'),
  textile('纺织品'),
  calligraphy('书法'),
  other('其他');

  const ArtifactCategory(this.displayName);

  final String displayName;

  static ArtifactCategory fromString(String value) {
    return ArtifactCategory.values.firstWhere(
      (category) => category.name == value,
      orElse: () => ArtifactCategory.other,
    );
  }
}

// 藏品状态
enum ArtifactStatus {
  recognized('已识别'),
  processing('处理中'),
  completed('已完成'),
  failed('失败');

  const ArtifactStatus(this.displayName);

  final String displayName;

  static ArtifactStatus fromString(String value) {
    return ArtifactStatus.values.firstWhere(
      (status) => status.name == value,
      orElse: () => ArtifactStatus.failed,
    );
  }
}

// 识别结果
class RecognitionResult extends Equatable {
  final Artifact artifact;
  final double confidence;
  final List<String> suggestions;
  final Map<String, dynamic> details;

  const RecognitionResult({
    required this.artifact,
    required this.confidence,
    required this.suggestions,
    required this.details,
  });

  @override
  List<Object> get props => [artifact, confidence, suggestions, details];

  factory RecognitionResult.fromJson(Map<String, dynamic> json) {
    return RecognitionResult(
      artifact: Artifact.fromJson(json['artifact']),
      confidence: (json['confidence'] as num).toDouble(),
      suggestions: (json['suggestions'] as List<dynamic>).cast<String>(),
      details: json['details'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'artifact': artifact.toJson(),
      'confidence': confidence,
      'suggestions': suggestions,
      'details': details,
    };
  }
}