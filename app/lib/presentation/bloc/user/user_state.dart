part of 'user_bloc.dart';

enum UserStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

class UserState extends Equatable {
  final UserStatus status;
  final User? user;
  final String? errorMessage;
  final List<UserActivity> activities;
  final bool isLoadingActivities;

  const UserState({
    required this.status,
    this.user,
    this.errorMessage,
    this.activities = const [],
    this.isLoadingActivities = false,
  });

  const UserState.initial()
      : status = UserStatus.initial,
        user = null,
        errorMessage = null,
        activities = const [],
        isLoadingActivities = false;

  const UserState.loading()
      : status = UserStatus.loading,
        user = null,
        errorMessage = null,
        activities = const [],
        isLoadingActivities = false;

  const UserState.authenticated(User user)
      : status = UserStatus.authenticated,
        user = user,
        errorMessage = null,
        activities = const [],
        isLoadingActivities = false;

  const UserState.unauthenticated()
      : status = UserStatus.unauthenticated,
        user = null,
        errorMessage = null,
        activities = const [],
        isLoadingActivities = false;

  const UserState.error(String message)
      : status = UserStatus.error,
        user = null,
        errorMessage = message,
        activities = const [],
        isLoadingActivities = false;

  UserState copyWith({
    UserStatus? status,
    User? user,
    String? errorMessage,
    List<UserActivity>? activities,
    bool? isLoadingActivities,
  }) {
    return UserState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
      activities: activities ?? this.activities,
      isLoadingActivities: isLoadingActivities ?? this.isLoadingActivities,
    );
  }

  @override
  List<Object?> get props => [
        status,
        user,
        errorMessage,
        activities,
        isLoadingActivities,
      ];

  @override
  String toString() {
    return 'UserState(status: $status, user: $user, errorMessage: $errorMessage)';
  }

  // 便捷方法
  bool get isAuthenticated => status == UserStatus.authenticated;
  bool get isUnauthenticated => status == UserStatus.unauthenticated;
  bool get isLoading => status == UserStatus.loading;
  bool get hasError => status == UserStatus.error;
}