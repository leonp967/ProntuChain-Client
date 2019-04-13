import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QueryData } from '../models/query-data.model';

const BACKEND_URL = 'http://localhost:3000/patient'

@Injectable({providedIn: 'root'})
export class PacienteService {

  constructor(private http: HttpClient) { }

  queryPatientData(cpf: string, dateFrom?: Date, dateTo?: Date){
    const queryData: QueryData = {
      cpf: cpf,
      dateFrom: dateFrom,
      dateTo: dateTo
    };
    this.http.post(BACKEND_URL + '/query', queryData)
      .subscribe(response => {
        const dados = JSON.parse(response.toString());
        return dados;
      }, error => {

      });
  }
}
