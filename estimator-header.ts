import { Component, ViewContainerRef } from '@angular/core';
import { NameIdEntity } from '@classes/name-id-entity';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ButtonMeta } from '@shared/button/interfaces/button-meta.interface';
import { distinctUntilChanged } from 'rxjs';
import { EstimatorHeaderService } from '../../services/estimator-header/estimator-header.service';
import { EstimatorFactorComponent } from '../estimator-factor/estimator-factor.component';
import { EstimatorFactor } from './../../../estimator-table/classes/estimator';
import { EstimatorTableService } from './../../../estimator-table/services/estimator-table/estimator-table.service';

/**
 * Компонент заголовка оценщика
 */

@UntilDestroy()
@Component({
  selector: 'tap-estimator-header',
  templateUrl: './estimator-header.component.html',
  styleUrls: ['./estimator-header.component.scss'],
})
export class EstimatorHeaderComponent {
  /**
   * Отображение тултипа
   */
  public showPopover = false;
  public buttonList: ButtonMeta[];
  // Список способов сохранения оценки
  public saveValues: NameIdEntity[];
  public saveButton?: ButtonMeta;
  public selectionSaveId!: number;

  /**
   * Данные оценки
   */
  public estimatorData!: EstimatorFactor | null;
  /**
   * Видимость коэффициентов
   */
  private factorsVisible: boolean;

  constructor(
    private readonly estimatorHeaderService: EstimatorHeaderService,
    public readonly viewContainerRef: ViewContainerRef,
    public readonly tableService: EstimatorTableService
  ) {
    this.buttonList = this.estimatorHeaderService.getButtonList();
    this.saveButton = this.buttonList.find((el) => el.id === 'saveAs');
    this.saveValues = [
      { id: 0, name: 'Общая оценка' },
      { id: 1, name: 'Версия для заказчика' },
      { id: 2, name: 'Обе версии (не реализовано)' },
    ];
    this.selectionSaveId = this.saveValues[0].id;
    this.factorsVisible = false;
    this.estimatorHeaderService
      .getEstimatorData()
      .pipe(untilDestroyed(this))
      .subscribe((el) => {
        this.estimatorData = el;
        this.createFactor(this.factorsVisible);
      });
    this.tableService.edit.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe((el) => {
      this.createFactor(el && this.factorsVisible);
    });
  }

  /**
   * Клик по кнопке
   * @param button Опции кнопки
   */
  public buttonClick(button: ButtonMeta): void {
    this.showPopover = button.id === this.saveButton?.id;
    if (!this.showPopover) {
      button.action();
    }
  }

  /**
   * Отвечает за показ коэффициентов
   */
  public setVisible(): void {
    this.factorsVisible = !this.factorsVisible;
    this.createFactor(this.factorsVisible);
  }

  /**
   * Смена видимости общей суммы
   * @param val Значение
   */
  public changeShowTotal(val: boolean): void {
    this.estimatorHeaderService.toggleTotal(val);
  }

  /**
   * Очистка и создание компонента
   * @param cond условие
   */
  private createFactor(cond: boolean): void {
    this.viewContainerRef.clear();
    if (cond) {
      this.viewContainerRef.createComponent(EstimatorFactorComponent);
    }
  }
}
