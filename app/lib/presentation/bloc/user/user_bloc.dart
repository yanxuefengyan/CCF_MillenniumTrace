import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../../domain/entities/user.dart';
import '../../../domain/usecases/get_user_profile.dart';
import '../../../domain/usecases/update_user_settings.dart';

part 'user_event.dart';
part 'user_state.dart';

class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUserProfile _getUserProfile;
  final UpdateUserSettings _updateUserSettings;

  UserBloc(this._getUserProfile, this._updateUserSettings) : super(const UserState.initial()) {
    on<UserEvent>((event, emit) {
      // TODO: implement event handler
    });
  }
}