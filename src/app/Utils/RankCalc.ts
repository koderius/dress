export class RankCalc {

  static AverageRank(rank: number[]) : number {

    const total = RankCalc.TotalRanks(rank);
    let average = 0;
    if(rank)
      rank.forEach((r, i)=>{average += r*(i+1)/total});
    return  Math.round(average);

  }

  static GetList(rank: number[] | undefined) : number[] {

    if(!rank)
      rank = [];
    else
      rank = rank.slice();

    for(let i = 0; i < 5; i++) {
      if(!rank[i])
        rank[i] = 0;
    }

    return rank;

  }

  static TotalRanks(rank: number[]) : number {
    let sum = 0;
    if(rank)
      rank.forEach((r)=>sum += (r || 0));
    return sum;
  }

  static StarRate(rank: number[], star: number) : string {
    if(rank)
      return Math.round(((rank[star-1] || 0) / RankCalc.TotalRanks(rank)) / 100) + '%';
    else
      return '0%';
  }

}
