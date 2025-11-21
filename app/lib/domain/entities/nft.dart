import 'package:equatable/equatable.dart';

// 影迹NFT实体
class TraceNFT extends Equatable {
  final String id;
  final String tokenId;
  final String artifactId;
  final String sceneId;
  final String name;
  final String description;
  final String imageUrl;
  final String contractAddress;
  final String transactionHash;
  final double donationAmount;
  final NFTStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic> metadata;

  const TraceNFT({
    required this.id,
    required this.tokenId,
    required this.artifactId,
    required this.sceneId,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.contractAddress,
    required this.transactionHash,
    required this.donationAmount,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    required this.metadata,
  });

  @override
  List<Object> get props => [
        id,
        tokenId,
        artifactId,
        sceneId,
        name,
        description,
        imageUrl,
        contractAddress,
        transactionHash,
        donationAmount,
        status,
        createdAt,
        updatedAt,
        metadata,
      ];

  @override
  String toString() {
    return 'TraceNFT(id: $id, tokenId: $tokenId, name: $name, status: $status)';
  }

  TraceNFT copyWith({
    String? id,
    String? tokenId,
    String? artifactId,
    String? sceneId,
    String? name,
    String? description,
    String? imageUrl,
    String? contractAddress,
    String? transactionHash,
    double? donationAmount,
    NFTStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return TraceNFT(
      id: id ?? this.id,
      tokenId: tokenId ?? this.tokenId,
      artifactId: artifactId ?? this.artifactId,
      sceneId: sceneId ?? this.sceneId,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      contractAddress: contractAddress ?? this.contractAddress,
      transactionHash: transactionHash ?? this.transactionHash,
      donationAmount: donationAmount ?? this.donationAmount,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  factory TraceNFT.fromJson(Map<String, dynamic> json) {
    return TraceNFT(
      id: json['id'] as String,
      tokenId: json['tokenId'] as String,
      artifactId: json['artifactId'] as String,
      sceneId: json['sceneId'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      imageUrl: json['imageUrl'] as String,
      contractAddress: json['contractAddress'] as String,
      transactionHash: json['transactionHash'] as String,
      donationAmount: (json['donationAmount'] as num).toDouble(),
      status: NFTStatus.fromString(json['status'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tokenId': tokenId,
      'artifactId': artifactId,
      'sceneId': sceneId,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'contractAddress': contractAddress,
      'transactionHash': transactionHash,
      'donationAmount': donationAmount,
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}

// NFT状态
enum NFTStatus {
  pending('铸造中'),
  confirmed('已确认'),
  failed('失败'),
  transferred('已转移');

  const NFTStatus(this.displayName);

  final String displayName;

  static NFTStatus fromString(String value) {
    return NFTStatus.values.firstWhere(
      (status) => status.name == value,
      orElse: () => NFTStatus.failed,
    );
  }
}

// NFT铸造请求
class MintNFTRequest extends Equatable {
  final String sceneId;
  final String artifactId;
  final String name;
  final String description;
  final double donationAmount;
  final String recipientAddress;
  final Map<String, dynamic> metadata;

  const MintNFTRequest({
    required this.sceneId,
    required this.artifactId,
    required this.name,
    required this.description,
    required this.donationAmount,
    required this.recipientAddress,
    required this.metadata,
  });

  @override
  List<Object> get props => [
        sceneId,
        artifactId,
        name,
        description,
        donationAmount,
        recipientAddress,
        metadata,
      ];

  factory MintNFTRequest.fromJson(Map<String, dynamic> json) {
    return MintNFTRequest(
      sceneId: json['sceneId'] as String,
      artifactId: json['artifactId'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      donationAmount: (json['donationAmount'] as num).toDouble(),
      recipientAddress: json['recipientAddress'] as String,
      metadata: json['metadata'] as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sceneId': sceneId,
      'artifactId': artifactId,
      'name': name,
      'description': description,
      'donationAmount': donationAmount,
      'recipientAddress': recipientAddress,
      'metadata': metadata,
    };
  }
}

// NFT铸造响应
class MintNFTResponse extends Equatable {
  final String transactionHash;
  final String tokenId;
  final String contractAddress;
  final NFTStatus status;
  final String message;

  const MintNFTResponse({
    required this.transactionHash,
    required this.tokenId,
    required this.contractAddress,
    required this.status,
    required this.message,
  });

  @override
  List<Object> get props => [
        transactionHash,
        tokenId,
        contractAddress,
        status,
        message,
      ];

  factory MintNFTResponse.fromJson(Map<String, dynamic> json) {
    return MintNFTResponse(
      transactionHash: json['transactionHash'] as String,
      tokenId: json['tokenId'] as String,
      contractAddress: json['contractAddress'] as String,
      status: NFTStatus.fromString(json['status'] as String),
      message: json['message'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'transactionHash': transactionHash,
      'tokenId': tokenId,
      'contractAddress': contractAddress,
      'status': status.name,
      'message': message,
    };
  }
}

// NFT收藏
class NFTCollection extends Equatable {
  final String id;
  final String name;
  final String description;
  final List<TraceNFT> nfts;
  final int totalCount;
  final double totalDonation;
  final DateTime createdAt;
  final DateTime updatedAt;

  const NFTCollection({
    required this.id,
    required this.name,
    required this.description,
    required this.nfts,
    required this.totalCount,
    required this.totalDonation,
    required this.createdAt,
    required this.updatedAt,
  });

  @override
  List<Object> get props => [
        id,
        name,
        description,
        nfts,
        totalCount,
        totalDonation,
        createdAt,
        updatedAt,
      ];

  factory NFTCollection.fromJson(Map<String, dynamic> json) {
    return NFTCollection(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      nfts: (json['nfts'] as List<dynamic>)
          .map((e) => TraceNFT.fromJson(e as Map<String, dynamic>))
          .toList(),
      totalCount: json['totalCount'] as int,
      totalDonation: (json['totalDonation'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'nfts': nfts.map((e) => e.toJson()).toList(),
      'totalCount': totalCount,
      'totalDonation': totalDonation,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

// NFT市场数据
class NFTMarketData extends Equatable {
  final String tokenId;
  final double floorPrice;
  final double lastSalePrice;
  final int totalVolume;
  final int holderCount;
  final List<PriceHistory> priceHistory;
  final DateTime lastUpdated;

  const NFTMarketData({
    required this.tokenId,
    required this.floorPrice,
    required this.lastSalePrice,
    required this.totalVolume,
    required this.holderCount,
    required this.priceHistory,
    required this.lastUpdated,
  });

  @override
  List<Object> get props => [
        tokenId,
        floorPrice,
        lastSalePrice,
        totalVolume,
        holderCount,
        priceHistory,
        lastUpdated,
      ];

  factory NFTMarketData.fromJson(Map<String, dynamic> json) {
    return NFTMarketData(
      tokenId: json['tokenId'] as String,
      floorPrice: (json['floorPrice'] as num).toDouble(),
      lastSalePrice: (json['lastSalePrice'] as num).toDouble(),
      totalVolume: json['totalVolume'] as int,
      holderCount: json['holderCount'] as int,
      priceHistory: (json['priceHistory'] as List<dynamic>)
          .map((e) => PriceHistory.fromJson(e as Map<String, dynamic>))
          .toList(),
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tokenId': tokenId,
      'floorPrice': floorPrice,
      'lastSalePrice': lastSalePrice,
      'totalVolume': totalVolume,
      'holderCount': holderCount,
      'priceHistory': priceHistory.map((e) => e.toJson()).toList(),
      'lastUpdated': lastUpdated.toIso8601String(),
    };
  }
}

// 价格历史
class PriceHistory extends Equatable {
  final DateTime date;
  final double price;
  final String transactionHash;
  final String buyer;
  final String seller;

  const PriceHistory({
    required this.date,
    required this.price,
    required this.transactionHash,
    required this.buyer,
    required this.seller,
  });

  @override
  List<Object> get props => [date, price, transactionHash, buyer, seller];

  factory PriceHistory.fromJson(Map<String, dynamic> json) {
    return PriceHistory(
      date: DateTime.parse(json['date'] as String),
      price: (json['price'] as num).toDouble(),
      transactionHash: json['transactionHash'] as String,
      buyer: json['buyer'] as String,
      seller: json['seller'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date.toIso8601String(),
      'price': price,
      'transactionHash': transactionHash,
      'buyer': buyer,
      'seller': seller,
    };
  }
}

// NFT统计信息
class NFTStatistics extends Equatable {
  final int totalMinted;
  final int confirmedCount;
  final int pendingCount;
  final int failedCount;
  final double totalDonation;
  final double averageDonation;
  final List<MonthlyDonation> monthlyDonations;

  const NFTStatistics({
    required this.totalMinted,
    required this.confirmedCount,
    required this.pendingCount,
    required this.failedCount,
    required this.totalDonation,
    required this.averageDonation,
    required this.monthlyDonations,
  });

  @override
  List<Object> get props => [
        totalMinted,
        confirmedCount,
        pendingCount,
        failedCount,
        totalDonation,
        averageDonation,
        monthlyDonations,
      ];

  factory NFTStatistics.fromJson(Map<String, dynamic> json) {
    return NFTStatistics(
      totalMinted: json['totalMinted'] as int,
      confirmedCount: json['confirmedCount'] as int,
      pendingCount: json['pendingCount'] as int,
      failedCount: json['failedCount'] as int,
      totalDonation: (json['totalDonation'] as num).toDouble(),
      averageDonation: (json['averageDonation'] as num).toDouble(),
      monthlyDonations: (json['monthlyDonations'] as List<dynamic>)
          .map((e) => MonthlyDonation.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalMinted': totalMinted,
      'confirmedCount': confirmedCount,
      'pendingCount': pendingCount,
      'failedCount': failedCount,
      'totalDonation': totalDonation,
      'averageDonation': averageDonation,
      'monthlyDonations': monthlyDonations.map((e) => e.toJson()).toList(),
    };
  }
}

// 月度捐赠统计
class MonthlyDonation extends Equatable {
  final DateTime month;
  final double amount;
  final int count;

  const MonthlyDonation({
    required this.month,
    required this.amount,
    required this.count,
  });

  @override
  List<Object> get props => [month, amount, count];

  factory MonthlyDonation.fromJson(Map<String, dynamic> json) {
    return MonthlyDonation(
      month: DateTime.parse(json['month'] as String),
      amount: (json['amount'] as num).toDouble(),
      count: json['count'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'month': month.toIso8601String(),
      'amount': amount,
      'count': count,
    };
  }
}