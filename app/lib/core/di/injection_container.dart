import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:hive_flutter/hive_flutter.dart';

// Bloc
import '../../presentation/bloc/theme/theme_bloc.dart';
import '../../presentation/bloc/user/user_bloc.dart';
import '../../presentation/bloc/camera/camera_bloc.dart';
import '../../presentation/bloc/scene/scene_bloc.dart';
import '../../presentation/bloc/nft/nft_bloc.dart';
import '../../presentation/bloc/settings/settings_bloc.dart';

// Data Sources
import '../../data/datasources/local/local_storage_datasource.dart';
import '../../data/datasources/remote/remote_datasource.dart';

// Repositories
import '../../data/repositories/artifact_repository_impl.dart';
import '../../data/repositories/user_repository_impl.dart';
import '../../data/repositories/nft_repository_impl.dart';

// Domain
import '../../domain/repositories/artifact_repository.dart';
import '../../domain/repositories/user_repository.dart';
import '../../domain/repositories/nft_repository.dart';
import '../../domain/usecases/recognize_artifact.dart';
import '../../domain/usecases/generate_scene.dart';
import '../../domain/usecases/mint_nft.dart';
import '../../domain/usecases/get_user_profile.dart';
import '../../domain/usecases/update_user_settings.dart';

// Core
import '../config/app_config.dart';
import '../network/dio_client.dart';
import '../network/api_endpoints.dart';
import '../utils/logger.dart';

final GetIt sl = GetIt.instance;

Future<void> initializeDependencies() async {
  // 初始化Hive
  await Hive.initFlutter();
  
  // 注册Hive适配器（如果有自定义类型）
  // Hive.registerAdapter(ArtifactModelAdapter());
  // Hive.registerAdapter(SceneModelAdapter());
  // Hive.registerAdapter(NFTModelAdapter());

  // 核心配置
  sl.registerLazySingleton(() => AppConfig());
  sl.registerLazySingleton(() => Logger());

  // 本地存储
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton(() => sharedPreferences);

  // 网络配置
  sl.registerLazySingleton(() => DioClient());
  sl.registerLazySingleton(() => ApiEndpoints());

  // 数据源
  sl.registerLazySingleton<LocalStorageDataSource>(
    () => LocalStorageDataSourceImpl(sl(), sl()),
  );
  
  sl.registerLazySingleton<RemoteDataSource>(
    () => RemoteDataSourceImpl(sl()),
  );

  // 仓储
  sl.registerLazySingleton<ArtifactRepository>(
    () => ArtifactRepositoryImpl(sl(), sl()),
  );
  
  sl.registerLazySingleton<UserRepository>(
    () => UserRepositoryImpl(sl(), sl()),
  );
  
  sl.registerLazySingleton<NFTRepository>(
    () => NFTRepositoryImpl(sl(), sl()),
  );

  // 用例
  sl.registerLazySingleton(
    () => RecognizeArtifact(sl()),
  );
  
  sl.registerLazySingleton(
    () => GenerateScene(sl()),
  );
  
  sl.registerLazySingleton(
    () => MintNFT(sl()),
  );
  
  sl.registerLazySingleton(
    () => GetUserProfile(sl()),
  );
  
  sl.registerLazySingleton(
    () => UpdateUserSettings(sl()),
  );

  // Bloc
  sl.registerFactory(() => ThemeBloc(sl()));
  sl.registerFactory(() => UserBloc(sl(), sl()));
  sl.registerFactory(() => CameraBloc(sl()));
  sl.registerFactory(() => SceneBloc(sl()));
  sl.registerFactory(() => NFTBloc(sl()));
  sl.registerFactory(() => SettingsBloc(sl(), sl()));

  // 工具类
  sl.registerLazySingleton(() => DeviceInfoUtil());
  sl.registerLazySingleton(() => PermissionUtil());
  sl.registerLazySingleton(() => StorageUtil(sl()));
}

// 清理依赖
Future<void> resetDependencies() async {
  await sl.reset();
}

// 获取依赖的便捷方法
T inject<T extends Object>() {
  return sl<T>();
}

// 检查依赖是否已注册
bool isRegistered<T extends Object>() {
  return sl.isRegistered<T>();
}

// 注销特定依赖
Future<void> unregister<T extends Object>() async {
  if (isRegistered<T>()) {
    await sl.unregister<T>();
  }
}

// 依赖注入容器管理类
class DIContainer {
  static DIContainer? _instance;
  static DIContainer get instance => _instance ??= DIContainer._();
  
  DIContainer._();

  final Map<Type, dynamic> _singletons = {};
  final Map<Type, dynamic Function()> _factories = {};

  // 注册单例
  void registerSingleton<T extends Object>(T instance) {
    _singletons[T] = instance;
  }

  // 注册工厂
  void registerFactory<T extends Object>(T Function() factory) {
    _factories[T] = factory;
  }

  // 获取实例
  T get<T extends Object>() {
    if (_singletons.containsKey(T)) {
      return _singletons[T];
    }
    
    if (_factories.containsKey(T)) {
      return _factories[T]();
    }
    
    throw Exception('No registration found for type $T');
  }

  // 清理所有依赖
  void reset() {
    _singletons.clear();
    _factories.clear();
  }

  // 注销特定类型的依赖
  void unregister<T extends Object>() {
    _singletons.remove(T);
    _factories.remove(T);
  }

  // 检查是否已注册
  bool isRegistered<T extends Object>() {
    return _singletons.containsKey(T) || _factories.containsKey(T);
  }
}

// 依赖作用域管理
class DIScope {
  final Map<Type, dynamic> _scopedInstances = {};
  final DIScope? _parent;

  DIScope([this._parent]);

  // 获取作用域实例
  T get<T extends Object>(T Function() factory) {
    if (_scopedInstances.containsKey(T)) {
      return _scopedInstances[T];
    }
    
    final instance = factory();
    _scopedInstances[T] = instance;
    return instance;
  }

  // 创建子作用域
  DIScope createChild() {
    return DIScope(this);
  }

  // 清理作用域
  void dispose() {
    _scopedInstances.clear();
  }
}

// 依赖注入装饰器示例
abstract class Injectable {
  // 标记需要注入的类
  static const String annotation = 'injectable';
}

// 懒加载依赖
class Lazy<T> {
  T? _instance;
  final T Function() _factory;

  Lazy(this._factory);

  T get value {
    return _instance ??= _factory();
  }

  bool get isInitialized => _instance != null;
}

// 异步依赖
class AsyncLazy<T> {
  T? _instance;
  final Future<T> Function() _factory;

  AsyncLazy(this._factory);

  Future<T> get value async {
    return _instance ??= await _factory();
  }

  bool get isInitialized => _instance != null;
}

// 条件依赖注入
class ConditionalDI {
  static Map<String, dynamic Function()> _conditions = {};

  static void registerCondition<T extends Object>(
    String condition,
    T Function() factory,
  ) {
    _conditions[condition] = factory;
  }

  static T? resolveByCondition<T extends Object>(String condition) {
    final factory = _conditions[condition];
    return factory != null ? factory() as T : null;
  }

  static void clearConditions() {
    _conditions.clear();
  }
}