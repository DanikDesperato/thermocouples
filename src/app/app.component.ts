import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { rangeValidator } from './validator';

interface SelectInterface {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private fb: FormBuilder) {}

  title = 'danter';
  selectedCalculate = '';
  selectedThermocouple: string;
  selectedTemperatureViewValue: string = '';
  temperatureRange = '';
  voltageRange = '';
  calculate: SelectInterface[] = [
    { value: 'temperature', viewValue: 'mV->T' },
    { value: 'voltage', viewValue: 'T->mV' },
  ];
  form: UntypedFormGroup;
  thermocouple: SelectInterface[] = [
    { value: 'R', viewValue: 'Type-R' },
    { value: 'B', viewValue: 'Type-B' },
    { value: 'E', viewValue: 'Type-E' },
    { value: 'J', viewValue: 'Type-J' },
    { value: 'K', viewValue: 'Type-K' },
    { value: 'N', viewValue: 'Type-N' },
    { value: 'S', viewValue: 'Type-S' },
    { value: 'T', viewValue: 'Type-T' },
    { value: 'A-1', viewValue: 'Type-A-1' },
    { value: 'A-2', viewValue: 'Type-A-2' },
    { value: 'A-3', viewValue: 'Type-A-3' },
  ];
  typesTemperature: SelectInterface[] = [
    { value: 'C', viewValue: '°C' },
    { value: 'F', viewValue: '°F' },
    { value: 'K', viewValue: 'K' },
  ];

  ngOnInit() {
    this.form = this.fb.group({
      calc_type: ['', [Validators.required]],
      thermo_type: ['R', [Validators.required]],
      mv_read: ['', [Validators.required]],
      temp_in: ['', [Validators.required]],
      scale_type: ['', [Validators.required]],
      tempamb: ['', [Validators.required]],
    });
    this.form?.get('scale_type')?.valueChanges?.subscribe((scaleType) => {
      this.thermRangeSet(this.form.get('thermo_type')?.value || '', scaleType);

      if (scaleType === 'K') {
        this.selectedTemperatureViewValue = scaleType;
      } else if (scaleType === 'C' || scaleType === 'F') {
        this.selectedTemperatureViewValue = '°' + scaleType;
      }
    });
    this.form?.get('thermo_type')?.valueChanges?.subscribe((thermoType) => {
      this.thermRangeSet(thermoType, this.form.get('scale_type')?.value || '');
      this.resetFields();
    });

    this.form?.get('calc_type')?.valueChanges?.subscribe((calcType) => {
      if (calcType === 'temperature') {
        this.form.get('temp_in')?.disable();
        this.form.get('mv_read')?.enable();
      } else if (calcType === 'voltage') {
        this.form.get('mv_read')?.disable();
        this.form.get('temp_in')?.enable();
      }
      this.resetFields();
    });
  }

  resetFields() {
    this.form.get('tempamb')?.setValue('');
    this.form.get('mv_read')?.setValue('');
    this.form.get('temp_in')?.setValue('');
  }

  // hideField(Ctype) //hides input elements based on calculator type
  // {
  //   if (Ctype === "1") {
  //     document.getElementById("div_mv").style.display = "inline";
  //     document.getElementById("div_temp").style.display = "none";
  //
  //     document.getElementById("res_mv").style.display = "none";
  //     document.getElementById("res_temp").style.display = "inline";
  //   } else {
  //     document.getElementById("div_mv").style.display = "none";
  //     document.getElementById("div_temp").style.display = "inline";
  //
  //     document.getElementById("res_mv").style.display = "inline";
  //     document.getElementById("res_temp").style.display = "none";
  //   }
  // }

  thermCalc() {
    //computes required values for each type
    let calcuType = this.form.get('calc_type')?.value;
    let thermoType = this.form.get('thermo_type')?.value;
    let mv_func1 = this.form.get('mv_read')?.value;
    let temp_func1f = this.form.get('temp_in')?.value;
    let scaleType = this.form.get('scale_type')?.value;
    let temp_amb = this.form.get('tempamb')?.value;
    let Coef = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //prepare coefficient array
    let Coef_amb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //prepare ambient coefficients array

    let temp_func1 = 0;
    switch (scaleType) {
      case 'C': //for Celsius
        temp_func1 = temp_func1f;
        break;

      case 'F': //for Fahrenheit
        temp_func1 = (temp_func1f - 32) * (5 / 9);
        temp_amb = (temp_amb - 32) * (5 / 9);
        break;

      case 'K': //for Kelvin
        temp_func1 = temp_func1f - 273.15;
        temp_amb = temp_amb - 273.15;
        break;
    }
    switch (
      thermoType //for ambient mv calculation
    ) {
      case 'B': //Type B
        if (temp_amb >= 0 && temp_amb <= 630.616) {
          //Range 1
          Coef_amb = [
            0,
            -0.24650818346 * Math.pow(10, -3),
            0.59040421171 * Math.pow(10, -5),
            -0.13257931636 * Math.pow(10, -8),
            0.15668291901 * Math.pow(10, -11),
            -0.1694452924 * Math.pow(10, -14),
            0.62990347094 * Math.pow(10, -18),
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        } else if (temp_amb > 630.616 && temp_amb <= 1820.0) {
          //Range 2
          Coef_amb = [
            -0.38938168621 * Math.pow(10, 1),
            0.2857174747 * Math.pow(10, -1),
            -0.84885104785 * Math.pow(10, -4),
            0.15785280164 * Math.pow(10, -6),
            -0.16835344864 * Math.pow(10, -9),
            0.11109794013 * Math.pow(10, -12),
            -0.44515431033 * Math.pow(10, -16),
            0.98975640821 * Math.pow(10, -20),
            -0.93791330289 * Math.pow(10, -24),
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        }
        break;

      case 'E': //Type E
        if (temp_amb >= -200 && temp_amb <= 0) {
          //Range 1
          Coef_amb = [
            0,
            0.58665508708 * Math.pow(10, -1),
            0.45410977124 * Math.pow(10, -4),
            -0.77998048686 * Math.pow(10, -6),
            -0.25800160843 * Math.pow(10, -7),
            -0.59452583057 * Math.pow(10, -9),
            -0.93214058667 * Math.pow(10, -11),
            -0.10287605534 * Math.pow(10, -12),
            -0.80370123621 * Math.pow(10, -15),
            -0.43979497391 * Math.pow(10, -17),
            -0.16414776355 * Math.pow(10, -19),
            -0.39673619516 * Math.pow(10, -22),
            -0.55827328721 * Math.pow(10, -25),
            -0.34657842013 * Math.pow(10, -28),
            0,
          ];
        } else if (temp_amb > 0 && temp_amb <= 1000) {
          //Range 2
          Coef_amb = [
            0,
            0.5866550871 * Math.pow(10, -1),
            0.45032275582 * Math.pow(10, -4),
            0.28908407212 * Math.pow(10, -7),
            -0.33056896652 * Math.pow(10, -9),
            0.6502440327 * Math.pow(10, -12),
            -0.19197495504 * Math.pow(10, -15),
            -0.12536600497 * Math.pow(10, -17),
            0.21489217569 * Math.pow(10, -20),
            -0.14388041782 * Math.pow(10, -23),
            0.35960899481 * Math.pow(10, -27),
            0,
            0,
            0,
            0,
          ];
        }
        break;

      case 'J': //Type J
        if (temp_amb >= -210 && temp_amb <= 760) {
          //Range 1
          Coef_amb = [
            0,
            0.50381187815 * Math.pow(10, -1),
            0.3047583693 * Math.pow(10, -4),
            -0.8568106572 * Math.pow(10, -7),
            0.13228195295 * Math.pow(10, -9),
            -0.17052958337 * Math.pow(10, -12),
            0.20948090697 * Math.pow(10, -15),
            -0.12538395336 * Math.pow(10, -18),
            0.15631725697 * Math.pow(10, -22),
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        } else if (temp_amb > 760 && temp_amb <= 1200) {
          //Range 2
          Coef_amb = [
            0.29645625681 * Math.pow(10, 3),
            -0.14976127786 * Math.pow(10, 1),
            0.31787103924 * Math.pow(10, -2),
            -0.31847686701 * Math.pow(10, -5),
            0.15720819004 * Math.pow(10, -8),
            -0.30691369056 * Math.pow(10, -12),
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        }
        break;

      case 'K': //Type K
        if (temp_amb >= -270 && temp_amb <= 0) {
          //Range 1
          Coef_amb = [
            0,
            0.39450128025 * Math.pow(10, -1),
            0.23622373598 * Math.pow(10, -4),
            -0.32858906784 * Math.pow(10, -6),
            -0.49904828777 * Math.pow(10, -8),
            -0.67509059173 * Math.pow(10, -10),
            -0.57410327428 * Math.pow(10, -12),
            -0.31088872894 * Math.pow(10, -14),
            -0.10451609365 * Math.pow(10, -16),
            -0.19889266878 * Math.pow(10, -19),
            -0.16322697486 * Math.pow(10, -22),
            0,
            0,
            0,
            0,
          ];
        } else if (temp_amb > 0 && temp_amb <= 1372) {
          //Range 2
          Coef_amb = [
            -0.17600413686 * Math.pow(10, -1),
            0.38921204975 * Math.pow(10, -1),
            0.18558770032 * Math.pow(10, -4),
            -0.99457592874 * Math.pow(10, -7),
            0.31840945719 * Math.pow(10, -9),
            -0.56072844889 * Math.pow(10, -12),
            0.56075059059 * Math.pow(10, -15),
            -0.32020720003 * Math.pow(10, -18),
            0.97151147152 * Math.pow(10, -22),
            -0.12104721275 * Math.pow(10, -25),
            0,
            0,
            0,
            0,
            0,
          ];

          //let a0 = 0.118597600000*Math.pow(10,0);  //unused values in source document
          //let a1 = -0.118343200000*Math.pow(10,-3); //values calculated without these
          //let a2 = 0.126968600000*Math.pow(10,3);
        }
        break;

      case 'N': //Type N
        if (temp_amb >= -200 && temp_amb <= 0) {
          //Range 1
          let Coef_amb = [
            0,
            0.26159105962 * Math.pow(10, -1),
            0.10957484228 * Math.pow(10, -4),
            -0.93841111554 * Math.pow(10, -7),
            -0.46412039759 * Math.pow(10, -10),
            -0.26303357716 * Math.pow(10, -11),
            -0.22653438003 * Math.pow(10, -13),
            -0.76089300791 * Math.pow(10, -16),
            -0.93419667835 * Math.pow(10, -19),
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        } else if (temp_amb > 0 && temp_amb <= 1300) {
          //Range 2
          let Coef_amb = [
            0,
            0.25929394601 * Math.pow(10, -1),
            0.1571014188 * Math.pow(10, -4),
            0.43825627237 * Math.pow(10, -7),
            -0.25261169794 * Math.pow(10, -9),
            0.64311819339 * Math.pow(10, -12),
            -0.10063471519 * Math.pow(10, -14),
            0.99745338992 * Math.pow(10, -18),
            -0.60863245607 * Math.pow(10, -21),
            0.20849229339 * Math.pow(10, -24),
            -0.30682196151 * Math.pow(10, -28),
            0,
            0,
            0,
            0,
          ];
        }
        break;

      case 'R': //Type R
        if (temp_amb >= -50 && temp_amb <= 1064.18) {
          //Range 1
          Coef_amb = [
            0,
            0.528961729765 * Math.pow(10, -2),
            0.139166589782 * Math.pow(10, -4),
            -0.238855693017 * Math.pow(10, -7),
            0.356916001063 * Math.pow(10, -10),
            -0.462347666298 * Math.pow(10, -13),
            0.500777441034 * Math.pow(10, -16),
            -0.373105886191 * Math.pow(10, -19),
            0.157716482367 * Math.pow(10, -22),
            -0.281038625251 * Math.pow(10, -26),
            0,
            0,
            0,
            0,
            0,
          ];
        } else if (temp_amb > 1064.18 && temp_amb <= 1664.5) {
          //Range 2
          Coef_amb = [
            0.295157925316 * Math.pow(10, 1),
            -0.252061251332 * Math.pow(10, -2),
            0.159564501865 * Math.pow(10, -4),
            -0.764085947576 * Math.pow(10, -8),
            0.205305291024 * Math.pow(10, -11),
            -0.293359668173 * Math.pow(10, -15),
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        } else if (temp_amb > 1664.5 && temp_amb <= 1768.1) {
          //Range 3
          Coef_amb = [
            0.152232118209 * Math.pow(10, 3),
            -0.268819888545 * Math.pow(10, 0),
            0.171280280471 * Math.pow(10, -3),
            -0.345895706453 * Math.pow(10, -7),
            -0.934633971046 * Math.pow(10, -14),
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        }
        break;

      case 'S': //Type S
        if (temp_amb >= -50 && temp_amb <= 1064.18) {
          //Range 1
          Coef_amb = [
            0,
            0.540313308631 * Math.pow(10, -2),
            0.12593428974 * Math.pow(10, -4),
            -0.232477968689 * Math.pow(10, -7),
            0.322028823036 * Math.pow(10, -10),
            -0.331465196389 * Math.pow(10, -13),
            0.255744251786 * Math.pow(10, -16),
            -0.125068871393 * Math.pow(10, -19),
            0.271443176145 * Math.pow(10, -23),
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        } else if (temp_amb > 1064.18 && temp_amb <= 1664.5) {
          //Range 2
          Coef_amb = [
            0.132900444085 * Math.pow(10, 1),
            0.334509311344 * Math.pow(10, -2),
            0.654805192818 * Math.pow(10, -5),
            -0.164856259209 * Math.pow(10, -8),
            0.129989605174 * Math.pow(10, -13),
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        } else if (temp_amb > 1664.5 && temp_amb <= 1768.1) {
          //Range 3
          Coef_amb = [
            0.146628232636 * Math.pow(10, 3),
            -0.258430516752 * Math.pow(10, 0),
            0.163693574641 * Math.pow(10, -3),
            -0.330439046987 * Math.pow(10, -7),
            -0.943223690612 * Math.pow(10, -14),
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        }
        break;

      case 'T': //Type T
        if (temp_amb >= -200 && temp_amb <= 0) {
          //Range 1
          Coef_amb = [
            0,
            0.38748106364 * Math.pow(10, -1),
            0.44194434347 * Math.pow(10, -4),
            0.11844323105 * Math.pow(10, -6),
            0.20032973554 * Math.pow(10, -7),
            0.90138019559 * Math.pow(10, -9),
            0.22651156593 * Math.pow(10, -10),
            0.36071154205 * Math.pow(10, -12),
            0.38493939883 * Math.pow(10, -14),
            0.28213521925 * Math.pow(10, -16),
            0.14251594779 * Math.pow(10, -18),
            0.48768662286 * Math.pow(10, -21),
            0.1079553927 * Math.pow(10, -23),
            0.13945027062 * Math.pow(10, -26),
            0.79795153927 * Math.pow(10, -30),
          ];
        } else if (temp_amb > 0 && temp_amb <= 400) {
          //Range 2
          Coef_amb = [
            0,
            0.38748106364 * Math.pow(10, -1),
            0.3329222788 * Math.pow(10, -4),
            0.20618243404 * Math.pow(10, -6),
            -0.21882256846 * Math.pow(10, -8),
            0.10996880928 * Math.pow(10, -10),
            -0.30815758772 * Math.pow(10, -13),
            0.4547913529 * Math.pow(10, -16),
            -0.27512901673 * Math.pow(10, -19),
            0,
            0,
            0,
            0,
            0,
            0,
          ];
        }
        break;
    }

    let amb_mv = 0;
    for (
      let j = 0;
      j <= 14;
      j++ //15th order polynomial summation (for ambient mv calculation)
    ) {
      amb_mv = amb_mv + Coef_amb[j] * Math.pow(temp_amb, j);
    }

    /*-------------------------------------------------------------------Ambient mV Ends Here-----------------------------------*/

    switch (
      thermoType //for main calculation
    ) {
      case 'B': //B Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            if (mv_func1 >= 0.291 && mv_func1 <= 2.431) {
              //Range 1
              let OOR_Flag = 0;
              Coef = [
                9.8423321 * Math.pow(10, 1),
                6.99715 * Math.pow(10, 2),
                -8.4765304 * Math.pow(10, 2),
                1.0052644 * Math.pow(10, 3),
                -8.3345952 * Math.pow(10, 2),
                4.5508542 * Math.pow(10, 2),
                -1.5523037 * Math.pow(10, 2),
                2.988675 * Math.pow(10, 1),
                -2.474286 * Math.pow(10, 0),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 2.431 && mv_func1 <= 13.82) {
              //Range 2
              let OOR_Flag = 0;
              Coef = [
                2.1315071 * Math.pow(10, 2),
                2.8510504 * Math.pow(10, 2),
                -5.2742887 * Math.pow(10, 1),
                9.9160804 * Math.pow(10, 0),
                -1.2965303 * Math.pow(10, 0),
                1.119587 * Math.pow(10, -1),
                -6.0625199 * Math.pow(10, -3),
                1.8661696 * Math.pow(10, -4),
                -2.4878585 * Math.pow(10, -6),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 13.82) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (mv_func1 < 0.291) {
              let OOR_Flag = 2;
            }
            break;

          case 'voltage': //T to mV
            if (temp_func1 >= 250 && temp_func1 <= 630.616) {
              //Range 1
              let OOR_Flag = 0;
              Coef = [
                0,
                -0.24650818346 * Math.pow(10, -3),
                0.59040421171 * Math.pow(10, -5),
                -0.13257931636 * Math.pow(10, -8),
                0.15668291901 * Math.pow(10, -11),
                -0.1694452924 * Math.pow(10, -14),
                0.62990347094 * Math.pow(10, -18),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 630.616 && temp_func1 <= 1820.0) {
              //Range 2
              let OOR_Flag = 0;
              Coef = [
                -0.38938168621 * Math.pow(10, 1),
                0.2857174747 * Math.pow(10, -1),
                -0.84885104785 * Math.pow(10, -4),
                0.15785280164 * Math.pow(10, -6),
                -0.16835344864 * Math.pow(10, -9),
                0.11109794013 * Math.pow(10, -12),
                -0.44515431033 * Math.pow(10, -16),
                0.98975640821 * Math.pow(10, -20),
                -0.93791330289 * Math.pow(10, -24),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1820.0) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (temp_func1 < 250) {
              let OOR_Flag = 2;
            }
            break;
        }
        break;

      case 'E': //E Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            if (mv_func1 >= -8.825 && mv_func1 <= 0) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                1.6977288 * Math.pow(10, 1),
                -4.351497 * Math.pow(10, -1),
                -1.5859697 * Math.pow(10, -1),
                -9.2502871 * Math.pow(10, -2),
                -2.6084314 * Math.pow(10, -2),
                -4.1360199 * Math.pow(10, -3),
                -3.403403 * Math.pow(10, -4),
                -1.156489 * Math.pow(10, -5),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 0 && mv_func1 <= 76.373) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                1.7057035 * Math.pow(10, 1),
                -2.3301759 * Math.pow(10, -1),
                6.5435585 * Math.pow(10, -3),
                -7.3562749 * Math.pow(10, -5),
                -1.7896001 * Math.pow(10, -6),
                8.4036165 * Math.pow(10, -8),
                -1.3735879 * Math.pow(10, -9),
                1.0629823 * Math.pow(10, -11),
                -3.2447087 * Math.pow(10, -14),
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 76.373) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (mv_func1 < -8.825) {
              let OOR_Flag = 2;
            }
            break;

          case 'voltage': //T to mV
            if (temp_func1 >= -200 && temp_func1 <= 0) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.58665508708 * Math.pow(10, -1),
                0.45410977124 * Math.pow(10, -4),
                -0.77998048686 * Math.pow(10, -6),
                -0.25800160843 * Math.pow(10, -7),
                -0.59452583057 * Math.pow(10, -9),
                -0.93214058667 * Math.pow(10, -11),
                -0.10287605534 * Math.pow(10, -12),
                -0.80370123621 * Math.pow(10, -15),
                -0.43979497391 * Math.pow(10, -17),
                -0.16414776355 * Math.pow(10, -19),
                -0.39673619516 * Math.pow(10, -22),
                -0.55827328721 * Math.pow(10, -25),
                -0.34657842013 * Math.pow(10, -28),
                0,
              ];
            } else if (temp_func1 > 0 && temp_func1 <= 1000) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.5866550871 * Math.pow(10, -1),
                0.45032275582 * Math.pow(10, -4),
                0.28908407212 * Math.pow(10, -7),
                -0.33056896652 * Math.pow(10, -9),
                0.6502440327 * Math.pow(10, -12),
                -0.19197495504 * Math.pow(10, -15),
                -0.12536600497 * Math.pow(10, -17),
                0.21489217569 * Math.pow(10, -20),
                -0.14388041782 * Math.pow(10, -23),
                0.35960899481 * Math.pow(10, -27),
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1000) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (temp_func1 < -200) {
              let OOR_Flag = 2;
            }
            break;
        }
        break;

      case 'J': //J Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            if (mv_func1 >= -8.095 && mv_func1 <= 0) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                1.9528268 * Math.pow(10, 1),
                -1.2286185 * Math.pow(10, 0),
                -1.0752178 * Math.pow(10, 0),
                -5.9086933 * Math.pow(10, -1),
                -1.7256713 * Math.pow(10, -1),
                -2.8131513 * Math.pow(10, -2),
                -2.396337 * Math.pow(10, -3),
                -8.3823321 * Math.pow(10, -5),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 0 && mv_func1 <= 42.919) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                1.978425 * Math.pow(10, 1),
                -2.001204 * Math.pow(10, -1),
                1.036969 * Math.pow(10, -2),
                -2.549687 * Math.pow(10, -4),
                3.585153 * Math.pow(10, -6),
                -5.344285 * Math.pow(10, -8),
                5.09989 * Math.pow(10, -10),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 42.919 && mv_func1 <= 69.553) {
              //Range 3
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                -3.11358187 * Math.pow(10, 3),
                3.00543684 * Math.pow(10, 2),
                -9.9477323 * Math.pow(10, 0),
                1.7027663 * Math.pow(10, -1),
                -1.43033468 * Math.pow(10, -3),
                4.73886084 * Math.pow(10, -6),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 69.553) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (mv_func1 < -8.095) {
              let OOR_Flag = 2;
            }
            break;

          case 'voltage': //T to mV
            if (temp_func1 >= -210 && temp_func1 <= 760) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.50381187815 * Math.pow(10, -1),
                0.3047583693 * Math.pow(10, -4),
                -0.8568106572 * Math.pow(10, -7),
                0.13228195295 * Math.pow(10, -9),
                -0.17052958337 * Math.pow(10, -12),
                0.20948090697 * Math.pow(10, -15),
                -0.12538395336 * Math.pow(10, -18),
                0.15631725697 * Math.pow(10, -22),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 760 && temp_func1 <= 1200) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0.29645625681 * Math.pow(10, 3),
                -0.14976127786 * Math.pow(10, 1),
                0.31787103924 * Math.pow(10, -2),
                -0.31847686701 * Math.pow(10, -5),
                0.15720819004 * Math.pow(10, -8),
                -0.30691369056 * Math.pow(10, -12),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1200) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (temp_func1 < 210) {
              let OOR_Flag = 2;
            }
            break;
        }
        break;

      case 'K': //K Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            if (mv_func1 >= -5.891 && mv_func1 <= 0) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                2.5173462 * Math.pow(10, 1),
                -1.1662878 * Math.pow(10, 0),
                -1.0833638 * Math.pow(10, 0),
                -8.977354 * Math.pow(10, -1),
                -3.7342377 * Math.pow(10, -1),
                -8.6632643 * Math.pow(10, -2),
                -1.0450598 * Math.pow(10, -2),
                -5.1920577 * Math.pow(10, -4),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 0 && mv_func1 <= 20.644) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                2.508355 * Math.pow(10, 1),
                7.860106 * Math.pow(10, -2),
                -2.503131 * Math.pow(10, -1),
                8.31527 * Math.pow(10, -2),
                -1.228034 * Math.pow(10, -2),
                9.804036 * Math.pow(10, -4),
                -4.41303 * Math.pow(10, -5),
                1.057734 * Math.pow(10, -6),
                -1.052755 * Math.pow(10, -8),
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 20.644 && mv_func1 <= 54.886) {
              //Range 3
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                -1.318058 * Math.pow(10, 2),
                4.830222 * Math.pow(10, 1),
                -1.646031 * Math.pow(10, 0),
                5.464731 * Math.pow(10, -2),
                -9.650715 * Math.pow(10, -4),
                8.802193 * Math.pow(10, -6),
                -3.11081 * Math.pow(10, -8),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 54.886) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (mv_func1 < -5.891) {
              let OOR_Flag = 2;
            }
            break;

          case 'voltage': //T to mV
            if (temp_func1 >= -270 && temp_func1 <= 0) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.39450128025 * Math.pow(10, -1),
                0.23622373598 * Math.pow(10, -4),
                -0.32858906784 * Math.pow(10, -6),
                -0.49904828777 * Math.pow(10, -8),
                -0.67509059173 * Math.pow(10, -10),
                -0.57410327428 * Math.pow(10, -12),
                -0.31088872894 * Math.pow(10, -14),
                -0.10451609365 * Math.pow(10, -16),
                -0.19889266878 * Math.pow(10, -19),
                -0.16322697486 * Math.pow(10, -22),
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 0 && temp_func1 <= 1372) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                -0.17600413686 * Math.pow(10, -1),
                0.38921204975 * Math.pow(10, -1),
                0.18558770032 * Math.pow(10, -4),
                -0.99457592874 * Math.pow(10, -7),
                0.31840945719 * Math.pow(10, -9),
                -0.56072844889 * Math.pow(10, -12),
                0.56075059059 * Math.pow(10, -15),
                -0.32020720003 * Math.pow(10, -18),
                0.97151147152 * Math.pow(10, -22),
                -0.12104721275 * Math.pow(10, -25),
                0,
                0,
                0,
                0,
                0,
              ];

              //let a0 = 0.118597600000*Math.pow(10,0);  //unused values in source document
              //let a1 = -0.118343200000*Math.pow(10,-3); //values calculated without these
              //let a2 = 0.126968600000*Math.pow(10,3);
            } else if (temp_func1 > 1372) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (temp_func1 < -270) {
              let OOR_Flag = 2;
            }
            break;
        }
        break;

      case 'N': //N Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            if (mv_func1 >= -3.99 && mv_func1 <= 0) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                3.8436847 * Math.pow(10, 1),
                1.1010485 * Math.pow(10, 0),
                5.2229312 * Math.pow(10, 0),
                7.2060525 * Math.pow(10, 0),
                5.8488586 * Math.pow(10, 0),
                2.7754916 * Math.pow(10, 0),
                7.7075166 * Math.pow(10, -1),
                1.1582665 * Math.pow(10, -1),
                7.3138868 * Math.pow(10, -3),
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 0 && mv_func1 <= 20.613) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                3.86896 * Math.pow(10, 1),
                -1.08267 * Math.pow(10, 0),
                4.70205 * Math.pow(10, -2),
                -2.12169 * Math.pow(10, -6),
                -1.17272 * Math.pow(10, -4),
                5.3928 * Math.pow(10, -6),
                -7.98156 * Math.pow(10, -8),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 20.613 && mv_func1 <= 47.513) {
              //Range 3
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                1.972485 * Math.pow(10, 1),
                3.300943 * Math.pow(10, 1),
                -3.915159 * Math.pow(10, -1),
                9.855391 * Math.pow(10, -3),
                -1.274371 * Math.pow(10, -4),
                7.767022 * Math.pow(10, -7),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 47.513) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (mv_func1 < -3.99) {
              let OOR_Flag = 2;
            }
            break;

          case 'voltage': //T to mV
            if (temp_func1 >= -200 && temp_func1 <= 0) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.26159105962 * Math.pow(10, -1),
                0.10957484228 * Math.pow(10, -4),
                -0.93841111554 * Math.pow(10, -7),
                -0.46412039759 * Math.pow(10, -10),
                -0.26303357716 * Math.pow(10, -11),
                -0.22653438003 * Math.pow(10, -13),
                -0.76089300791 * Math.pow(10, -16),
                -0.93419667835 * Math.pow(10, -19),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 0 && temp_func1 <= 1300) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.25929394601 * Math.pow(10, -1),
                0.1571014188 * Math.pow(10, -4),
                0.43825627237 * Math.pow(10, -7),
                -0.25261169794 * Math.pow(10, -9),
                0.64311819339 * Math.pow(10, -12),
                -0.10063471519 * Math.pow(10, -14),
                0.99745338992 * Math.pow(10, -18),
                -0.60863245607 * Math.pow(10, -21),
                0.20849229339 * Math.pow(10, -24),
                -0.30682196151 * Math.pow(10, -28),
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1300) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (temp_func1 < -200) {
              let OOR_Flag = 2;
            }
            break;
        }
        break;

      case 'R': //R Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            if (mv_func1 >= -0.226 && mv_func1 <= 1.923) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                1.889138 * Math.pow(10, 2),
                -9.383529 * Math.pow(10, 1),
                1.3068619 * Math.pow(10, 2),
                -2.270358 * Math.pow(10, 2),
                3.5145659 * Math.pow(10, 2),
                -3.89539 * Math.pow(10, 2),
                2.8239471 * Math.pow(10, 2),
                -1.2607281 * Math.pow(10, 2),
                3.1353611 * Math.pow(10, 1),
                -3.3187769 * Math.pow(10, 0),
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 1.923 && mv_func1 <= 13.228) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                1.334584505 * Math.pow(10, 1),
                1.472644573 * Math.pow(10, 2),
                -1.844024844 * Math.pow(10, 1),
                4.031129726 * Math.pow(10, 0),
                -6.24942836 * Math.pow(10, -1),
                6.468412046 * Math.pow(10, -2),
                -4.458750426 * Math.pow(10, -3),
                1.994710149 * Math.pow(10, -4),
                -5.31340179 * Math.pow(10, -6),
                6.481976217 * Math.pow(10, -8),
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 13.228 && mv_func1 <= 19.739) {
              //Range 3
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                -8.199599416 * Math.pow(10, 1),
                1.553962042 * Math.pow(10, 2),
                -8.342197663 * Math.pow(10, 0),
                4.279433549 * Math.pow(10, -1),
                -1.19157791 * Math.pow(10, -2),
                1.492290091 * Math.pow(10, -4),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 19.739 && mv_func1 <= 21.103) {
              //Range 4
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                3.406177836 * Math.pow(10, 4),
                -7.023729171 * Math.pow(10, 3),
                5.582903813 * Math.pow(10, 2),
                -1.952394635 * Math.pow(10, 1),
                2.560740231 * Math.pow(10, -1),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 21.103) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (mv_func1 < -0.226) {
              let OOR_Flag = 2;
            }
            break;

          case 'voltage': //T to mV
            if (temp_func1 >= -50 && temp_func1 <= 1064.18) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.528961729765 * Math.pow(10, -2),
                0.139166589782 * Math.pow(10, -4),
                -0.238855693017 * Math.pow(10, -7),
                0.356916001063 * Math.pow(10, -10),
                -0.462347666298 * Math.pow(10, -13),
                0.500777441034 * Math.pow(10, -16),
                -0.373105886191 * Math.pow(10, -19),
                0.157716482367 * Math.pow(10, -22),
                -0.281038625251 * Math.pow(10, -26),
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1064.18 && temp_func1 <= 1664.5) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0.295157925316 * Math.pow(10, 1),
                -0.252061251332 * Math.pow(10, -2),
                0.159564501865 * Math.pow(10, -4),
                -0.764085947576 * Math.pow(10, -8),
                0.205305291024 * Math.pow(10, -11),
                -0.293359668173 * Math.pow(10, -15),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1664.5 && temp_func1 <= 1768.1) {
              //Range 3
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0.152232118209 * Math.pow(10, 3),
                -0.268819888545 * Math.pow(10, 0),
                0.171280280471 * Math.pow(10, -3),
                -0.345895706453 * Math.pow(10, -7),
                -0.934633971046 * Math.pow(10, -14),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1768.1) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (temp_func1 < -50) {
              let OOR_Flag = 2;
            }
            break;
        }
        break;

      case 'S': //S Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            if (mv_func1 >= -0.235 && mv_func1 <= 1.874) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                1.8494946 * Math.pow(10, 2),
                -8.00504062 * Math.pow(10, 1),
                1.0223743 * Math.pow(10, 2),
                -1.52248592 * Math.pow(10, 2),
                1.88821343 * Math.pow(10, 2),
                -1.59085941 * Math.pow(10, 2),
                8.2302788 * Math.pow(10, 1),
                -2.34181944 * Math.pow(10, 1),
                2.7978626 * Math.pow(10, 0),
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 1.874 && mv_func1 <= 11.95) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                1.291507177 * Math.pow(10, 1),
                1.466298863 * Math.pow(10, 2),
                -1.534713402 * Math.pow(10, 1),
                3.145945973 * Math.pow(10, 0),
                -4.163257839 * Math.pow(10, -1),
                3.187963771 * Math.pow(10, -2),
                -1.2916375 * Math.pow(10, -3),
                2.183475087 * Math.pow(10, -5),
                -1.447379511 * Math.pow(10, -7),
                8.211272125 * Math.pow(10, -9),
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 11.95 && mv_func1 <= 17.536) {
              //Range 3
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                -8.087801117 * Math.pow(10, 1),
                1.621573104 * Math.pow(10, 2),
                -8.536869453 * Math.pow(10, 0),
                4.719686976 * Math.pow(10, -1),
                -1.441693666 * Math.pow(10, -2),
                2.08161889 * Math.pow(10, -4),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 17.536 && mv_func1 <= 18.693) {
              //Range 4
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                5.333875126 * Math.pow(10, 4),
                -1.235892298 * Math.pow(10, 4),
                1.092657613 * Math.pow(10, 3),
                -4.265693686 * Math.pow(10, 1),
                6.24720542 * Math.pow(10, -1),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 18.693) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (mv_func1 < -0.235) {
              let OOR_Flag = 2;
            }
            break;

          case 'voltage': //T to mV
            if (temp_func1 >= -50 && temp_func1 <= 1064.18) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.540313308631 * Math.pow(10, -2),
                0.12593428974 * Math.pow(10, -4),
                -0.232477968689 * Math.pow(10, -7),
                0.322028823036 * Math.pow(10, -10),
                -0.331465196389 * Math.pow(10, -13),
                0.255744251786 * Math.pow(10, -16),
                -0.125068871393 * Math.pow(10, -19),
                0.271443176145 * Math.pow(10, -23),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1064.18 && temp_func1 <= 1664.5) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0.132900444085 * Math.pow(10, 1),
                0.334509311344 * Math.pow(10, -2),
                0.654805192818 * Math.pow(10, -5),
                -0.164856259209 * Math.pow(10, -8),
                0.129989605174 * Math.pow(10, -13),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1664.5 && temp_func1 <= 1768.1) {
              //Range 3
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0.146628232636 * Math.pow(10, 3),
                -0.258430516752 * Math.pow(10, 0),
                0.163693574641 * Math.pow(10, -3),
                -0.330439046987 * Math.pow(10, -7),
                -0.943223690612 * Math.pow(10, -14),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 1768.1) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (temp_func1 < -50) {
              let OOR_Flag = 2;
            }
            break;
        }
        break;

      case 'T': //T Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            if (mv_func1 >= -5.603 && mv_func1 <= 0) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                2.5949192 * Math.pow(10, 1),
                -2.1316967 * Math.pow(10, -1),
                7.9018692 * Math.pow(10, -1),
                4.2527777 * Math.pow(10, -1),
                1.3304473 * Math.pow(10, -1),
                2.0241446 * Math.pow(10, -2),
                1.2668171 * Math.pow(10, -3),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 0 && mv_func1 <= 20.872) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                2.5928 * Math.pow(10, 1),
                -7.602961 * Math.pow(10, -1),
                4.637791 * Math.pow(10, -2),
                -2.165394 * Math.pow(10, -3),
                6.048144 * Math.pow(10, -5),
                -7.293422 * Math.pow(10, -7),
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (mv_func1 > 20.872) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (mv_func1 < -5.603) {
              let OOR_Flag = 2;
            }
            break;

          case 'voltage': //T to mV
            if (temp_func1 >= -200 && temp_func1 <= 0) {
              //Range 1
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.38748106364 * Math.pow(10, -1),
                0.44194434347 * Math.pow(10, -4),
                0.11844323105 * Math.pow(10, -6),
                0.20032973554 * Math.pow(10, -7),
                0.90138019559 * Math.pow(10, -9),
                0.22651156593 * Math.pow(10, -10),
                0.36071154205 * Math.pow(10, -12),
                0.38493939883 * Math.pow(10, -14),
                0.28213521925 * Math.pow(10, -16),
                0.14251594779 * Math.pow(10, -18),
                0.48768662286 * Math.pow(10, -21),
                0.1079553927 * Math.pow(10, -23),
                0.13945027062 * Math.pow(10, -26),
                0.79795153927 * Math.pow(10, -30),
              ];
            } else if (temp_func1 > 0 && temp_func1 <= 400) {
              //Range 2
              let OOR_Flag = 0; //Out of Range OFF
              Coef = [
                0,
                0.38748106364 * Math.pow(10, -1),
                0.3329222788 * Math.pow(10, -4),
                0.20618243404 * Math.pow(10, -6),
                -0.21882256846 * Math.pow(10, -8),
                0.10996880928 * Math.pow(10, -10),
                -0.30815758772 * Math.pow(10, -13),
                0.4547913529 * Math.pow(10, -16),
                -0.27512901673 * Math.pow(10, -19),
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            } else if (temp_func1 > 400) {
              let OOR_Flag = 1;
            } //Out of Range ON
            else if (temp_func1 < -200) {
              let OOR_Flag = 2;
            }
            break;
        }
        break;

      case 'A-1': //A-1 Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            Coef = [
              0.9643027,
              7.95 * Math.pow(10, 1),
              -5.0 * Math.pow(10, 0),
              6.34 * Math.pow(10, -1),
              -4.74 * Math.pow(10, -2),
              2.18 * Math.pow(10, -3),
              -5.83 * Math.pow(10, -5),
              8.24 * Math.pow(10, -7),
              -4.59 * Math.pow(10, -9),
              0,
              0,
              0,
              0,
              0,
              0,
            ];
            break;

          case 'voltage': //T to mV
            Coef = [
              0,
              1.2 * Math.pow(10, -2),
              1.65 * Math.pow(10, -5),
              -2.76 * Math.pow(10, -8),
              2.73 * Math.pow(10, -11),
              -1.76 * Math.pow(10, -14),
              6.95 * Math.pow(10, -18),
              -1.52 * Math.pow(10, -21),
              1.39 * Math.pow(10, -25),
              0,
              0,
              0,
              0,
              0,
              0,
              0,
            ];
            break;
        }

        break;

      case 'A-2': //A-2 Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            Coef = [
              1.1196428,
              8.06 * Math.pow(10, 1),
              -6.23 * Math.pow(10, 0),
              9.34 * Math.pow(10, -1),
              -8.26 * Math.pow(10, -2),
              4.41 * Math.pow(10, -3),
              -1.36 * Math.pow(10, -4),
              2.22 * Math.pow(10, -6),
              -1.45 * Math.pow(10, -8),
              0,
              0,
              0,
              0,
              0,
              0,
            ];
            break;

          case 'voltage': //T to mV
            Coef = [
              0,
              1.16 * Math.pow(10, -2),
              2.15 * Math.pow(10, -5),
              -4.53 * Math.pow(10, -8),
              5.82 * Math.pow(10, -11),
              -4.73 * Math.pow(10, -14),
              2.27 * Math.pow(10, -17),
              -5.85 * Math.pow(10, -21),
              6.15 * Math.pow(10, -25),
              0,
              0,
              0,
              0,
              0,
              0,
              0,
            ];
            break;
        }

        break;

      case 'A-3': //A-3 Type
        switch (calcuType) {
          case 'temperature': //mV to T(inverse)
            Coef = [
              0.8769216,
              8.15 * Math.pow(10, 1),
              -5.93 * Math.pow(10, 0),
              8.7 * Math.pow(10, -1),
              -7.68 * Math.pow(10, -2),
              4.18 * Math.pow(10, -3),
              -1.34 * Math.pow(10, -4),
              2.34 * Math.pow(10, -6),
              -1.7 * Math.pow(10, -8),
              0,
              0,
              0,
              0,
              0,
              0,
            ];
            break;

          case 'voltage': //T to mV
            Coef = [
              0,
              1.17 * Math.pow(10, -2),
              1.82 * Math.pow(10, -5),
              -3.44 * Math.pow(10, -8),
              3.36 * Math.pow(10, -11),
              -2.92 * Math.pow(10, -14),
              1.28 * Math.pow(10, -17),
              -2.98 * Math.pow(10, -21),
              2.78 * Math.pow(10, -25),
              0,
              0,
              0,
              0,
              0,
              0,
              0,
            ];
            break;
        }

        break;
    }

    let result = 0;
    switch (calcuType) {
      case 'temperature':
        for (
          let i = 0;
          i <= 14;
          i++ //15th order polynomial summation (main equation for all types)
        ) {
          result =
            result + Coef[i] * Math.pow(parseFloat(mv_func1) + amb_mv, i);
        }

        //TempScale Adjustments
        if (scaleType === 'F') {
          //for fahrenheit
          result = result * (9 / 5) + 32;
        } else if (scaleType === 'K') {
          //for kelvin
          result = result + 273.15;
        }

        result = Math.round(result * 1000) / 1000;
        this.form.get('temp_in')?.setValue(result - amb_mv);
        break;

      case 'voltage':
        for (
          let i = 0;
          i <= 14;
          i++ //15th order polynomial summation (main equation for all types)
        ) {
          result = result + Coef[i] * Math.pow(temp_func1, i);
        }
        result = Math.round(result * 1000) / 1000;
        this.form.get('mv_read')?.setValue(result - amb_mv);
        break;
    }

    // if (OOR_Flag === 0) //Not out of range
    // {
    //   if (temp_amb > 60) //ambient out of range error handling starts here
    //   {
    //     alert("Ambient temperature too high.");
    //   } else if (temp_amb < 0) {
    //     alert("Ambient temperature too low.");
    //   } else {
    //     switch (calcuType) {
    //       case "1": //mV to T
    //         document.getElementById("resultFieldtemp").value = result;
    //         break;
    //
    //       case "2": //T to mV
    //         document.getElementById("resultFieldmv").value = result;
    //         break;
    //     }
    //   }
    // } else if (OOR_Flag === 1) //Over the Range
    // {
    //   switch (calcuType) {
    //     case "1":
    //       alert("Input voltage too high.");
    //       break;
    //
    //     case "2":
    //       alert("Input temperature too high.");
    //       break;
    //   }
    //
    // } else if (OOR_Flag === 2) //Under the Range
    // {
    //   switch (calcuType) {
    //     case "1":
    //       alert("Input voltage too low.");
    //       break;
    //
    //     case "2":
    //       alert("Input temperature too low.");
    //       break;
    //   }
    //
    // }
  }

  getRangeValues(
    thermType: string,
    scaleType: string //displays the range for current thermocouple
  ) {
    let minTemp = 0;
    let maxTemp = 0;
    let minVoltage = 0;
    let maxVoltage = 0;

    if (scaleType === 'C') {
      //for Celsius
      switch (thermType) {
        case 'B': //Type B
          minTemp = 250;
          maxTemp = 1820;
          minVoltage = 0.291;
          maxVoltage = 13.82;
          break;
        case 'E': //Type E
          minTemp = -200;
          maxTemp = 1000;
          minVoltage = -8.825;
          maxVoltage = 76.373;
          break;

        case 'J': //Type J
          minTemp = -210;
          maxTemp = 1200;
          minVoltage = -8.095;
          maxVoltage = 69.553;

          break;

        case 'K': //Type K
          minTemp = -200;
          maxTemp = 1372;
          minVoltage = -5.8915;
          maxVoltage = 54.886;
          break;

        case 'N': //Type N
          minTemp = -200;
          maxTemp = 1300;
          minVoltage = -3.99;
          maxVoltage = 47.513;
          break;

        case 'R': //Type R
          minTemp = -50;
          maxTemp = 1768.1;
          minVoltage = -0.226;
          maxVoltage = 21.103;
          break;

        case 'S': //Type S
          minTemp = -50;
          maxTemp = 1768.1;
          minVoltage = -0.235;
          maxVoltage = 18.693;
          break;

        case 'T': //Type T
          minTemp = -200;
          maxTemp = 400;
          minVoltage = -5.603;
          maxVoltage = 20.872;

          break;

        case 'A-1': //Type A-1
          minTemp = 0;
          maxTemp = 2500;
          minVoltage = 0;
          maxVoltage = 33.64;

          break;
        case 'A-2': //Type A-2
          minTemp = 0;
          maxTemp = 1800;
          minVoltage = 0;
          maxVoltage = 27.232;
          break;

        case 'A-3': //Type A-3
          minTemp = 0;
          maxTemp = 1800;
          minVoltage = 0;
          maxVoltage = 26.773;
          break;
      }
    } //end if and switch

    if (scaleType === 'F') {
      //for Fahrenheit
      switch (thermType) {
        case 'B': //Type B
          minTemp = 482;
          maxTemp = 3308;
          minVoltage = 0.291;
          maxVoltage = 13.82;
          break;

        case 'E': //Type E
          minTemp = -328;
          maxTemp = 1832;
          minVoltage = -8.825;
          maxVoltage = 76.373;
          break;

        case 'J': //Type J
          minTemp = -346;
          maxTemp = 2192;
          minVoltage = -8.095;
          maxVoltage = 69.553;
          break;

        case 'K': //Type K
          minTemp = -328;
          maxTemp = 2501.6;
          minVoltage = -5.891;
          maxVoltage = 54.886;

          break;

        case 'N': //Type N
          minTemp = -328;
          maxTemp = 2372;
          minVoltage = -3.99;
          maxVoltage = 47.513;
          break;

        case 'R': //Type R
          minTemp = -58;
          maxTemp = 3214.58;
          minVoltage = -0.226;
          maxVoltage = 21.103;
          break;

        case 'S': //Type S
          minTemp = -58;
          maxTemp = 3214.58;
          minVoltage = -0.235;
          maxVoltage = 18.693;
          break;

        case 'T': //Type T
          minTemp = -328;
          maxTemp = 752;
          minVoltage = -5.603;
          maxVoltage = 20.872;
          break;
        case 'A-1': //Type A-1
          minTemp = 32;
          maxTemp = 4532;
          minVoltage = 0;
          maxVoltage = 33.64;

          break;
        case 'A-2': //Type A-2
          minTemp = 32;
          maxTemp = 3272;
          minVoltage = 0;
          maxVoltage = 27.232;
          break;

        case 'A-3': //Type A-3
          minTemp = 32;
          maxTemp = 3272;
          minVoltage = 0;
          maxVoltage = 26.773;
          break;
      }
    } //end if and switch

    if (scaleType === 'K') {
      //for Kelvin
      switch (thermType) {
        case 'B': //Type B
          minTemp = 523.15;
          maxTemp = 2093.15;
          minVoltage = 0.291;
          maxVoltage = 13.82;
          break;

        case 'E': //Type E
          minTemp = 73.15;
          maxTemp = 1273.15;
          minVoltage = -8.825;
          maxVoltage = 76.373;
          break;

        case 'J': //Type J
          minTemp = 63.15;
          maxTemp = 1473.15;
          minVoltage = -8.095;
          maxVoltage = 69.553;

          break;

        case 'K': //Type K
          minTemp = 73.15;
          maxTemp = 1645.15;
          minVoltage = -5.891;
          maxVoltage = 54.886;
          break;

        case 'N': //Type N
          minTemp = 73.15;
          maxTemp = 1573.15;
          minVoltage = -3.99;
          maxVoltage = 47.513;
          break;

        case 'R': //Type R
          minTemp = 223.15;
          maxTemp = 2041.25;
          minVoltage = -0.226;
          maxVoltage = 21.103;
          break;

        case 'S': //Type S
          minTemp = 223.15;
          maxTemp = 2041.25;
          minVoltage = -0.235;
          maxVoltage = 18.693;
          break;

        case 'T': //Type T
          minTemp = 73.15;
          maxTemp = 673.15;
          minVoltage = -5.603;
          maxVoltage = 20.872;
          break;

        case 'A-1': //Type A-1
          minTemp = 273.16;
          maxTemp = 2773.16;
          minVoltage = 0;
          maxVoltage = 33.64;

          break;
        case 'A-2': //Type A-2
          minTemp = 273.16;
          (maxTemp = 2073), 16;
          minVoltage = 0;
          maxVoltage = 27.232;
          break;

        case 'A-3': //Type A-3
          minTemp = 273.16;
          maxTemp = 2073.16;
          minVoltage = 0;
          maxVoltage = 26.773;
          break;
      }
    } //end if and switch
    return { minTemp, maxTemp, minVoltage, maxVoltage };
  }

  thermRangeSet(thermType: string, scaleType: string) {
    let ranges;
    try {
      ranges = this.getRangeValues(thermType, scaleType);
    } catch (error) {
      console.error(error);
      return;
    }

    this.temperatureRange = `${ranges.minTemp} to ${ranges.maxTemp} &deg;${scaleType}`;
    this.voltageRange = `${ranges.minVoltage} to ${ranges.maxVoltage} mV`;

    this.form
      .get('temp_in')
      ?.setValidators([
        Validators.required,
        rangeValidator(ranges.minTemp, ranges.maxTemp),
      ]);
    this.form
      .get('mv_read')
      ?.setValidators([
        Validators.required,
        rangeValidator(ranges.minVoltage, ranges.maxVoltage),
      ]);

    this.form.get('temp_in')?.updateValueAndValidity();
    this.form.get('mv_read')?.updateValueAndValidity();
  }

  //
  // thermRangeSet(scaleType: string) {
  //   switch (scaleType) {
  //     case "C": //Type R
  //       this.temperatureRange = "-50 to 1768.100 °C";
  //       this.voltageRange = "-0.226 to 21.103 mV";
  //       break;
  //
  //     case "F": //Type R
  //       this.temperatureRange = "-58 to 3214.58 °F";
  //       this.voltageRange = "-0.226 to 21.103 mV";
  //       break;
  //
  //     case "K": //Type R
  //       this.temperatureRange = "223.15 to 2041.25 K";
  //       this.voltageRange = "-0.226 to 21.103 mV";
  //       break;
  //   }
  // }

  // updateAmb(Tscale) { макс значения для  Ambient Temperature
  //   switch (Tscale) {
  //     case "1":
  //       document.getElementById("tempamb").value = 25;
  //       break;
  //
  //     case "2":
  //       document.getElementById("tempamb").value = 77;
  //       break;
  //
  //     case "3":
  //       document.getElementById("tempamb").value = 298;
  //       break;
  //   }
  // }
  //
  // clearFields() {
  //   document.getElementById("resultFieldtemp").value = "";
  //   document.getElementById("resultFieldmv").value = "";
  // }

  onTypeTemperatureChange(event: any) {
    this.selectedTemperatureViewValue = '';
    const selected = this.typesTemperature.find(
      (type) => type.value === event.value
    );
    this.selectedTemperatureViewValue = selected ? selected.viewValue : '';
  }
}
