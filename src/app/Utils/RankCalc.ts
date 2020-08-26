import {Ranks} from '../models/Feedback';

export class RankCalc {

  static GetList(rank: Ranks | undefined) : number[] {
    const ar: number[] = [];
    for (let i = 0; i < 5; i++) {
      ar[i] = (rank && rank['s' + (i + 1)]) || 0;
    }
    return ar;
  }

  static TotalRanks(rank: Ranks) : number {
    let sum = 0;
    if(rank)
      this.GetList(rank).forEach((r)=>sum += (r || 0));
    return sum;
  }
  
  static AverageRank(rank: Ranks) : number {
    const total = RankCalc.TotalRanks(rank);
    let average = 0;
    if(rank)
      this.GetList(rank).forEach((r, i)=>{average += r*(i+1)/total});
    return  Math.round(average);
  }

  static StarRate(rank: Ranks, star: number) : string {
    if(rank)
      return Math.round(((this.GetList(rank)[star-1] || 0) / RankCalc.TotalRanks(rank)) * 100) + '%';
    else
      return '0%';
  }

}
