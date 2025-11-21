part of 'user_bloc.dart';

abstract class UserEvent extends Equatable {
  const UserEvent();

  @override
  List<Object> get props => [];
}

// 获取用户资料
class GetUserProfile extends UserEvent {
  final String userId;

  const GetUserProfile(this.userId);

  @override
  List<Object> get props => [userId];
}

// 更新用户设置
class UpdateUserSettingsEvent extends UserEvent {
  final UserSettings settings;

  const UpdateUserSettingsEvent(this.settings);

  @override
  List<Object> get props => [settings];
}

// 更新用户头像
class UpdateUserAvatar extends UserEvent {
  final String avatarUrl;

  const UpdateUserAvatar(this.avatarUrl);

  @override
  List<Object> get props => [avatarUrl];
}

// 更新用户名
class UpdateUsername extends UserEvent {
  final String username;

  const UpdateUsername(this.username);

  @override
  List<Object> get props => [username];
}

// 更新邮箱
class UpdateEmail extends UserEvent {
  final String email;

  const UpdateEmail(this.email);

  @override
  List<Object> get props => [email];
}

// 更新通知设置
class UpdateNotificationSettings extends UserEvent {
  final NotificationSettings notificationSettings;

  const UpdateNotificationSettings(this.notificationSettings);

  @override
  List<Object> get props => [notificationSettings];
}

// 更新隐私设置
class UpdatePrivacySettings extends UserEvent {
  final PrivacySettings privacySettings;

  const UpdatePrivacySettings(this.privacySettings);

  @override
  List<Object> get props => [privacySettings];
}

// 解锁成就
class UnlockAchievement extends UserEvent {
  final String achievementId;

  const UnlockAchievement(this.achievementId);

  @override
  List<Object> get props => [achievementId];
}

// 获取用户活动历史
class GetUserActivity extends UserEvent {
  final String userId;
  final int? limit;
  final int? offset;

  const GetUserActivity(this.userId, {this.limit, this.offset});

  @override
  List<Object> get props => [userId, limit, offset];
}

// 刷新用户数据
class RefreshUserData extends UserEvent {}

// 用户登出
class UserLogout extends UserEvent {}