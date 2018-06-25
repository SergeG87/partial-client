import { Report as IReport, ReportInput as IReportInput } from '../types/Report';
const uuidv4 = require('uuid/v4');
import BaseService from './baseService';

export default class ReportsService extends BaseService {
  static reportsRoute = SERVICES.WORKFILE_REPORTS;

  static requestCache: Map<string, Array<IReport> | IReport> = new Map();

  public static async getReports(workfile_id: number | string): Promise<Array<IReport>> {
    try {
      var reports = await this.getRequest<Array<IReport>>(
        this.buildRoute(this.reportsRoute, { workfile_id: workfile_id }),
        true
      );
      return reports;
    } catch (err) {
      return [{ report: err }];
    }
  }

  public static async createReport(
    workfile_id: number | string,
    report: IReportInput
  ): Promise<IReport> {
    let route = this.buildRoute(this.reportsRoute, {
      workfile_id: workfile_id
    });
    return await this.postJSONRequest<IReportInput, IReport>(route, report);
  }
  //
  // public static async updateReport(
  //   workfile_id: number | string,
  //   report_id: number | string,
  //   report: IReportInput
  // ): Promise<IReport> {
  //   let route = this.buildRoute(this.reportsRoute, {
  //     workfile_id: workfile_id,
  //     report_id: report_id
  //   });
  //   return await this.putJSONRequest<IReportInput, IReport>(route, report);
  // }

  // mock method: provide static data
  public static emulateGetReports(workfile_id: number | string): Array<IReport> {
    try {
      const reports = [{
        report: {
          pages: [
            {
              items: [
                {id: uuidv4(), x: 0, y: 0, w: 12, h: 2, html: '<p style=\"margin-top: 0px; text-align: center;\"><b><u>Organization Name, LLC</u></b></p>'},
                {id: uuidv4(), x: 0, y: 2, w: 7, h: 25, html: '<div><table><tbody><tr><td><u><b>Owner/Occupant:</b></u></td><td style=\"text-align: left;\">Steve Wilson</td></tr><tr><td><b><u>Property Address:</u></b></td><td style=\"text-align: left;\">1234 Test St.<br></td></tr><tr><td><b><u>State/County:</u></b></td><td style=\"text-align: left;\">Nebraska/York</td></tr><tr><td><b><u>Highest &amp; Best Use:</u></b></td><td style=\"text-align: left;\">Agricultural Use (Crop Production) As if Vacant</td></tr><tr><td><b><u>Zoning:</u></b></td><td style=\"text-align: left;\">AG-1 (Agricultural District)</td></tr><tr><td><b><u>Unit Type:</u></b></td><td style=\"text-align: left;\">Economic Sized Unit</td></tr><tr><td><b><u>FEMA Community:</u></b></td><td style=\"text-align: left;\">York</td></tr><tr><td><b><u>FEMA MAP#:</u></b></td><td style=\"text-align: left;\">69GSF69A69H</td></tr><tr><td><b><u>FEMA Zone/Date:</u></b></td><td style=\"text-align: left;\">Zone A &amp; X /May 16, 2008</td></tr><tr><td><b><u>Legal Description:</u></b></td><td style=\"text-align: left;\">2 parcels of land totalling 105.39 acres</td></tr><tr><td><b><u>SEC:</u></b></td><td style=\"text-align: left;\">00</td></tr><tr><td><b><u>TWP:</u></b></td><td style=\"text-align: left;\">00N</td></tr><tr><td><b><u>RGE:</u></b></td><td style=\"text-align: left;\">00W</td></tr><tr><td><b><u>Attached:</u></b></td><td style=\"text-align: left;\">X</td></tr><tr><td><b><u>Purpose of Report:</u></b></td><td style=\"text-align: left;\">Develop an opinion of Market Value for use in loan financing and/or loan servicing.</td></tr><tr><td><b><u>Use/Intended User(s):</u></b></td><td style=\"text-align: left;\">Loan Financing and/or Servicing / Any Bank</td></tr><tr><td><b><u>Rights Appraised:</u></b></td><td style=\"text-align: left;\">Fee Simple subject to site restrictions, easements and encroachments of record</td></tr><tr><td><b><u>Value Definition:</u></b></td><td style=\"text-align: left;\">Market Value</td></tr><tr><td><b><u>Assignment:</u></b></td><td style=\"text-align: left;\">Market Value Appraisal</td></tr></tbody></table></div>'},
                {id: uuidv4(), x: 7, y: 2, w: 5, h: 6, html: '<figure class=\"styles__right--25YmQ\" style=\"width: 90%;\"><img src=\"http://s3-wp-lyleprintingandp.netdna-ssl.com/wp-content/uploads/2016/05/16145916/aerial-farmland-.jpg\"></figure>'},
                {id: uuidv4(), x: 7, y: 8, w: 5, h: 10, html: '<div><table class=\"styles__right--25YmQ\" style=\"width: 90%;\"><tbody><tr><td><u><b>File:</b></u></td><td style=\"text-align: left;\">Workfile1<br></td></tr><tr><td><b><u>Exposure Time:</u></b></td><td style=\"text-align: left;\">1-6 Months<br></td></tr><tr><td><b><u>Marketing Time:</u></b></td><td style=\"text-align: left;\">1-6 Months</td></tr><tr><td><b><u>Zip Code:</u></b><br></td><td style=\"text-align: left;\">68817</td></tr><tr><td><b><u>Property Code #:</u></b></td><td style=\"text-align: left;\">N/A</td></tr><tr><td><b><u>FAMC Comdty Gp:</u></b></td><td style=\"text-align: left;\">N/A</td></tr><tr><td><b><u>Primary Land Type:</u></b></td><td style=\"text-align: left;\">Agricultural / SFR</td></tr><tr><td><b><u>Primary Commodity:</u></b></td><td style=\"text-align: left;\">Corn/Soybeans</td></tr></tbody></table></div>'},
              ]
            },
            {
              items: [
                {id: uuidv4(), x: 0, y: 0, w: 12, h: 7, html: '<div style=\"text-align: right;\">File #: 27856828</div><div style=\"text-align: center;\"><h1 style=\"text-align: center;\"><u>Uniform Agricultural Appraisal Report</u></h1><h3 style=\"text-align: center;\"><b><u>Property Description</u></b></h3><p style=\"text-align: center;\">1234 Test St. / 2 Tracts in Section 00-T00N-R00W York, NE<br><b><u>BORROWER</u></b>: Steve Wilson<br><b><u>OWNER</u></b>: Steve Wilson</p></div>'},
                {id: uuidv4(), x: 3, y: 7, w: 6, h: 7, html: '<figure><img src=\"http://www.cornandsoybeandigest.com/sites/cornandsoybeandigest.com/files/styles/article_featured_standard/public/0130M2-1653A_0.jpg?itok=VADEO7KR\"></figure>'},
                {id: uuidv4(), x: 0, y: 14, w: 12, h: 11, html: '<div style=\"text-align: center;\"><p><b style=\"font-size: 16px;\">Any Bank USA<br></b><span style=\"font-size: 16px;\">PO Box 10<br></span><span style=\"font-size: 16px;\">Anytown, NE</span></p></u></h3><h4 style=\"text-align: center;\"></h4><h3 style=\"text-align: center;\"><u font-size:=\"\" 16px;=\"\"><u>Intended User:<br></u></u><u font-size:=\"\" 16px;=\"\" style=\"font-size: 1rem;\">Any Bank USA</u></h3><h4 style=\"text-align: center;\"></h4><h3 style=\"text-align: center;\"><u font-size:=\"\" 16px;=\"\"><u>Prepared By:</u></u></h3><p style=\"text-align: center;\"><u font-size:=\"\" 16px;=\"\">Your Name, Certified General Real Estate Appraiser<br>Organization Name, LLC<br>6572 Test St.<br>York, NE<br></u></p><p style=\"text-align: center;\"><u font-size:=\"\" 16px;=\"\"><b><u>Prepared:</u></b>&nbsp;04/23/17</u></p><h4 style=\"text-align: center;\"><p><u font-size:=\"\" 16px;=\"\"><br></u></p></div>'},
              ]
            }
          ]

        }
      }];
      return reports;
    } catch (err) {
      return [{ report: err }];
    }
  }

  // mock method
  public static emulateCreateReport(
      workfile_id: number | string,
      report: IReportInput
  ): IReport {
    console.log('Emulate report save!', workfile_id, report);
    return report;
  }

}
