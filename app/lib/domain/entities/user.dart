import 'package:equatable/equatable.dart';
import 'artifact.dart';
import 'nft.dart';

// 用户实体
class User extends Equatable {
  final String id;
  final String username;
  final String? email;
  final String? avatar;
  final UserPlatform platform;
  final UserStatus status;
  final UserStatistics statistics;
  final UserSettings settings;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic> metadata;

  const User({
    required this.id,
    required this.username,
    this.email,
    this.avatar,
    required this.platform,
    required this.status,
    required this.statistics,
    required this.settings,
    required this.createdAt,
    required this.updatedAt,
    required this.metadata,
  });

  @override
  List<Object?> get props => [
        id,
        username,
        email,
        avatar,
        platform,
        status,
        statistics,
        settings,
        createdAt,
        updatedAt,
        metadata,
      ];

  @override
  String toString() {
    return 'User(id: $id, username: $username, platform: $platform, status: $status)';
  }

  User copyWith({
    String? id,
    String? username,
    String? email,
    String? avatar,
    UserPlatform? platform,
    UserStatus? status,
    UserStatistics? statistics,
    UserSettings? settings,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      platform: platform ?? this.platform,
      status: status ?? this.status,
      statistics: statistics ?? this.statistics,
      settings: settings ?? this.settings,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String?,
      avatar: json['avatar'] as String?,
      platform: UserPlatform.fromString(json['platform'] as String),
      status: UserStatus.fromString(json['status'] as String),
      statistics: UserStatistics.fromJson(json['statistics'] as Map<String, dynamic>),
      settings: UserSettings.fromJson(json['settings'] as Map<String, dynamic>),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'avatar': avatar,
      'platform': platform.name,
      'status': status.name,
      'statistics': statistics.toJson(),
      'settings': settings.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

// 用户平台
enum UserPlatform {
  android('Android'),
  ios('iOS'),
  web('Web'),
  unknown('未知');

  const UserPlatform(this.displayName);

  final String displayName;

  static UserPlatform fromString(String value) {
    return UserPlatform.values.firstWhere(
      (platform) => platform.name == value,
      orElse: () => UserPlatform.unknown,
    );
  }
}

// 用户状态
enum UserStatus {
  active('活跃'),
  inactive('非活跃'),
  suspended('已暂停'),
  banned('已封禁');

  const UserStatus(this.displayName);

  final String displayName;

  static UserStatus fromString(String value) {
    return UserStatus.values.firstWhere(
      (status) => status.name == value,
      orElse: () => UserStatus.inactive,
    );
  }
}

// 用户统计信息
class UserStatistics extends Equatable {
  final int scenesCreated;
  final int nftsMinted;
  final double totalDonation;
  final int viewingTime;
  final List<Achievement> achievements;
  final List<String> favoriteCategories;

  const UserStatistics({
    required this.scenesCreated,
    required this.nftsMinted,
    required this.totalDonation,
    required this.viewingTime,
    required this.achievements,
    required this.favoriteCategories,
  });

  @override
  List<Object> get props => [
        scenesCreated,
        nftsMinted,
        totalDonation,
        viewingTime,
        achievements,
        favoriteCategories,
      ];

  factory UserStatistics.fromJson(Map<String, dynamic> json) {
    return UserStatistics(
      scenesCreated: json['scenesCreated'] as int,
      nftsMinted: json['nftsMinted'] as int,
      totalDonation: (json['totalDonation'] as num).toDouble(),
      viewingTime: json['viewingTime'] as int,
      achievements: (json['achievements'] as List<dynamic>)
          .map((e) => Achievement.fromJson(e as Map<String, dynamic>))
          .toList(),
      favoriteCategories: (json['favoriteCategories'] as List<dynamic>).cast<String>(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'scenesCreated': scenesCreated,
      'nftsMinted': nftsMinted,
      'totalDonation': totalDonation,
      'viewingTime': viewingTime,
      'achievements': achievements.map((e) => e.toJson()).toList(),
      'favoriteCategories': favoriteCategories,
    };
  }
}

// 成就
class Achievement extends Equatable {
  final String id;
  final String name;
  final String description;
  final AchievementRarity rarity;
  final String? iconUrl;
  final DateTime unlockedAt;
  final Map<String, dynamic> metadata;

  const Achievement({
    required this.id,
    required this.name,
    required this.description,
    required this.rarity,
    this.iconUrl,
    required this.unlockedAt,
    required this.metadata,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        rarity,
        iconUrl,
        unlockedAt,
        metadata,
      ];

  factory Achievement.fromJson(Map<String, dynamic> json) {
    return Achievement(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      rarity: AchievementRarity.fromString(json['rarity'] as String),
      iconUrl: json['iconUrl'] as String?,
      unlockedAt: DateTime.parse(json['unlockedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'rarity': rarity.name,
      'iconUrl': iconUrl,
      'unlockedAt': unlockedAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

// 成就稀有度
enum AchievementRarity {
  common('普通'),
  rare('稀有'),
  epic('史诗'),
  legendary('传奇');

  const AchievementRarity(this.displayName);

  final String displayName;

  static AchievementRarity fromString(String value) {
    return AchievementRarity.values.firstWhere(
      (rarity) => rarity.name == value,
      orElse: () => AchievementRarity.common,
    );
  }
}

// 用户设置
class UserSettings extends Equatable {
  final String language;
  final String quality;
  final bool autoSave;
  final NotificationSettings notifications;
  final PrivacySettings privacy;
  final Map<String, dynamic> customSettings;

  const UserSettings({
    required this.language,
    required this.quality,
    required this.autoSave,
    required this.notifications,
    required this.privacy,
    required this.customSettings,
  });

  @override
  List<Object> get props => [
        language,
        quality,
        autoSave,
        notifications,
        privacy,
        customSettings,
      ];

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      language: json['language'] as String,
      quality: json['quality'] as String,
      autoSave: json['autoSave'] as bool,
      notifications: NotificationSettings.fromJson(
        json['notifications'] as Map<String, dynamic>,
      ),
      privacy: PrivacySettings.fromJson(
        json['privacy'] as Map<String, dynamic>,
      ),
      customSettings: json['customSettings'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'language': language,
      'quality': quality,
      'autoSave': autoSave,
      'notifications': notifications.toJson(),
      'privacy': privacy.toJson(),
      'customSettings': customSettings,
    };
  }
}

// 通知设置
class NotificationSettings extends Equatable {
  final bool nftMinted;
  final bool donationCompleted;
  final bool sceneShared;
  final bool systemUpdates;
  final bool marketing;

  const NotificationSettings({
    required this.nftMinted,
    required this.donationCompleted,
    required this.sceneShared,
    required this.systemUpdates,
    required this.marketing,
  });

  @override
  List<Object> get props => [
        nftMinted,
        donationCompleted,
        sceneShared,
        systemUpdates,
        marketing,
      ];

  factory NotificationSettings.fromJson(Map<String, dynamic> json) {
    return NotificationSettings(
      nftMinted: json['nft_minted'] as bool,
      donationCompleted: json['donation_completed'] as bool,
      sceneShared: json['scene_shared'] as bool,
      systemUpdates: json['system_updates'] as bool,
      marketing: json['marketing'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nft_minted': nftMinted,
      'donation_completed': donationCompleted,
      'scene_shared': sceneShared,
      'system_updates': systemUpdates,
      'marketing': marketing,
    };
  }
}

// 隐私设置
class PrivacySettings extends Equatable {
  final bool shareAnalytics;
  final bool allowPersonalization;
  final bool publicProfile;
  final bool dataCollection;

  const PrivacySettings({
    required this.shareAnalytics,
    required this.allowPersonalization,
    required this.publicProfile,
    required this.dataCollection,
  });

  @override
  List<Object> get props => [
        shareAnalytics,
        allowPersonalization,
        publicProfile,
        dataCollection,
      ];

  factory PrivacySettings.fromJson(Map<String, dynamic> json) {
    return PrivacySettings(
      shareAnalytics: json['share_analytics'] as bool,
      allowPersonalization: json['allow_personalization'] as bool,
      publicProfile: json['public_profile'] as bool,
      dataCollection: json['data_collection'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'share_analytics': shareAnalytics,
      'allow_personalization': allowPersonalization,
      'public_profile': publicProfile,
      'data_collection': dataCollection,
    };
  }
}

// 用户活动记录
class UserActivity extends Equatable {
  final String id;
  final String userId;
  final ActivityType type;
  final String? targetId;
  final String? targetType;
  final String description;
  final Map<String, dynamic> metadata;
  final DateTime createdAt;

  const UserActivity({
    required this.id,
    required this.userId,
    required this.type,
    this.targetId,
    this.targetType,
    required this.description,
    required this.metadata,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        type,
        targetId,
        targetType,
        description,
        metadata,
        createdAt,
      ];

  factory UserActivity.fromJson(Map<String, dynamic> json) {
    return UserActivity(
      id: json['id'] as String,
      userId: json['userId'] as String,
      type: ActivityType.fromString(json['type'] as String),
      targetId: json['targetId'] as String?,
      targetType: json['targetType'] as String?,
      description: json['description'] as String,
      metadata: json['metadata'] as Map<String, dynamic>,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'type': type.name,
      'targetId': targetId,
      'targetType': targetType,
      'description': description,
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

// 活动类型
enum ActivityType {
  sceneCreated('创建场景'),
  nftMinted('铸造NFT'),
  donationMade('进行捐赠'),
  sceneShared('分享场景'),
  profileUpdated('更新资料'),
  settingsChanged('修改设置'),
  achievementUnlocked('解锁成就');

  const ActivityType(this.displayName);

  final String displayName;

  static ActivityType fromString(String value) {
    return ActivityType.values.firstWhere(
      (type) => type.name == value,
      orElse: () => ActivityType.sceneCreated,
    );
  }
}